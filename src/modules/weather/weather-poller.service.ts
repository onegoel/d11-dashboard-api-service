import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type { OnModuleInit } from "@nestjs/common";
import axios from "axios";
import { MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_HOURLY_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "wind_speed_10m",
  "wind_direction_10m",
  "cloud_cover",
  "precipitation_probability",
  "rain",
].join(",");

const MAX_LOOKAHEAD_MS = 48 * 60 * 60 * 1000;
const WINDOW_HOURS_EACH_SIDE = 2;
const DEW_TIMELINE_HOURS = 4;
const DEW_TIMELINE_INTERVAL_MINUTES = 30;

// Map UTC offset strings (as stored in some ground records) to IANA names.
// Intl.DateTimeFormat rejects bare offset strings like "+05:30".
const OFFSET_TO_IANA: Record<string, string> = {
  "+05:30": "Asia/Kolkata",
  "+05:00": "Asia/Karachi",
  "+06:00": "Asia/Dhaka",
  "+08:00": "Asia/Singapore",
  "+01:00": "Europe/London",
  "+00:00": "UTC",
  "-05:00": "America/New_York",
  "-06:00": "America/Chicago",
  "-07:00": "America/Denver",
  "-08:00": "America/Los_Angeles",
};

function normalizeTimezone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  const mapped = OFFSET_TO_IANA[tz.trim()];
  if (mapped) return mapped;
  // Validate it's a real IANA timezone; fall back to UTC if not.
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

type WeatherStage = "T48H" | "T24H" | "T6H" | "T60M";

type PollPolicy = {
  stage: WeatherStage;
  frequencyMinutes: number | null;
};

type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation?: string;
  hourly_units?: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    dew_point_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    cloud_cover?: number[];
    precipitation_probability?: number[];
    rain?: number[];
  };
};

type WeatherBand = "HIGH" | "MEDIUM" | "LOW";
type DewBand = "HEAVY" | "MEDIUM" | "LOW";

type WeatherScores = {
  xDewIndex: {
    value: number | null;
    band: DewBand | null;
    timeline: Array<{
      time: string;
      approxOver: number;
      dewIndex: number | null;
    }>;
  };
  xDewOnset: {
    time: string | null;
    approxOver: number | null;
    dewIndex: number | null;
  };
  xBattingEase: {
    score: number | null;
    band: WeatherBand | null;
  };
  xBallSwing: {
    score: number | null;
    band: WeatherBand | null;
    temperatureGradient: number | null;
  };
  xPitchMoisture: {
    score: number | null;
    band: WeatherBand | null;
  };
};

type WeatherSnapshot = {
  fetchedAt: string;
  stage: WeatherStage;
  frequencyMinutes: number | null;
  matchLocalHourKey: string;
  focusWindowHours: number;
  timezone: string;
  timezoneAbbreviation: string | null;
  units: Record<string, string>;
  centerHour: {
    time: string;
    temperatureC: number | null;
    humidityPct: number | null;
    dewPointC: number | null;
    windSpeedKph: number | null;
    windDirectionDeg: number | null;
    cloudCoverPct: number | null;
    precipProbabilityPct: number | null;
    rainMm: number | null;
  };
  hourlyWindow: Array<{
    time: string;
    temperatureC: number | null;
    humidityPct: number | null;
    dewPointC: number | null;
    windSpeedKph: number | null;
    windDirectionDeg: number | null;
    cloudCoverPct: number | null;
    precipProbabilityPct: number | null;
    rainMm: number | null;
  }>;
  scores: WeatherScores;
};

type StoredWeatherForecast = {
  source: "open-meteo";
  latitude: number;
  longitude: number;
  timezone: string;
  lastFetchedAt: string;
  latestStage: WeatherStage;
  matchDateIso: string;
  snapshots: WeatherSnapshot[];
};

@Injectable()
export class WeatherPollerService implements OnModuleInit {
  private readonly logger = new Logger(WeatherPollerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.refreshDueWeatherForecasts("startup");
  }

  @Cron("*/15 * * * *", { timeZone: "Asia/Kolkata" })
  async scheduledWeatherRefresh() {
    await this.refreshDueWeatherForecasts("cron");
  }

  async refreshDueWeatherForecasts(trigger: "startup" | "cron") {
    const now = new Date();
    const maxDate = new Date(now.getTime() + MAX_LOOKAHEAD_MS);

    const matches = await this.prisma.client.match.findMany({
      where: {
        status: { not: MatchStatus.COMPLETED },
        matchDate: { gt: now, lte: maxDate },
        ground: {
          is: {
            latitude: { not: null },
            longitude: { not: null },
          },
        },
      },
      select: {
        id: true,
        matchNo: true,
        matchDate: true,
        weatherForecast: true,
        ground: {
          select: {
            id: true,
            name: true,
            city: true,
            latitude: true,
            longitude: true,
            timezone: true,
          },
        },
      },
      orderBy: { matchDate: "asc" },
    });

    if (matches.length === 0) {
      this.logger.log(
        `[weather:${trigger}] No matches in weather polling window`,
      );
      return;
    }

    let refreshed = 0;
    let skipped = 0;

    for (const match of matches) {
      const policy = this.resolvePolicy(match.matchDate, now);
      if (!policy) {
        skipped++;
        continue;
      }

      const existing = this.parseStoredForecast(match.weatherForecast);
      if (!this.isDue(existing, policy, now)) {
        skipped++;
        continue;
      }

      const ground = match.ground;
      if (ground?.latitude == null || ground?.longitude == null) {
        skipped++;
        continue;
      }

      try {
        const payload = await this.fetchForecast({
          latitude: ground.latitude,
          longitude: ground.longitude,
          matchDate: match.matchDate,
          timezone: ground.timezone,
          stage: policy.stage,
          frequencyMinutes: policy.frequencyMinutes,
        });

        const next = this.mergeSnapshot(existing, {
          latitude: ground.latitude,
          longitude: ground.longitude,
          matchDateIso: match.matchDate.toISOString(),
          snapshot: payload,
        });

        await this.prisma.client.match.update({
          where: { id: match.id },
          data: { weatherForecast: next as any },
        });

        refreshed++;
      } catch (error) {
        this.logger.warn(
          `[weather:${trigger}] Match ${match.matchNo} weather refresh failed: ${String(error)}`,
        );
      }
    }

    this.logger.log(
      `[weather:${trigger}] processed=${matches.length} refreshed=${refreshed} skipped=${skipped}`,
    );
  }

  async ensureForecastForMatch(
    matchId: string,
    trigger: "on-demand" | "startup" | "cron" = "on-demand",
  ): Promise<boolean> {
    const now = new Date();

    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        matchNo: true,
        matchDate: true,
        status: true,
        weatherForecast: true,
        ground: {
          select: {
            latitude: true,
            longitude: true,
            timezone: true,
          },
        },
      },
    });

    if (!match || match.status === MatchStatus.COMPLETED) {
      return false;
    }

    const policy = this.resolvePolicy(match.matchDate, now);
    if (!policy) {
      return false;
    }

    const ground = match.ground;
    if (!ground || ground.latitude == null || ground.longitude == null) {
      return false;
    }

    const existing = this.parseStoredForecast(match.weatherForecast);
    if (!this.isDue(existing, policy, now)) {
      return existing != null;
    }

    try {
      const payload = await this.fetchForecast({
        latitude: ground.latitude,
        longitude: ground.longitude,
        matchDate: match.matchDate,
        timezone: ground.timezone,
        stage: policy.stage,
        frequencyMinutes: policy.frequencyMinutes,
      });

      const next = this.mergeSnapshot(existing, {
        latitude: ground.latitude,
        longitude: ground.longitude,
        matchDateIso: match.matchDate.toISOString(),
        snapshot: payload,
      });

      await this.prisma.client.match.update({
        where: { id: match.id },
        data: { weatherForecast: next as any },
      });

      this.logger.log(
        `[weather:${trigger}] Hydrated forecast for match ${match.matchNo}`,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `[weather:${trigger}] Match ${match.matchNo} on-demand weather refresh failed: ${String(error)}`,
      );
      return false;
    }
  }

  private resolvePolicy(matchDate: Date, now: Date): PollPolicy | null {
    const msToStart = matchDate.getTime() - now.getTime();

    if (msToStart <= 0 || msToStart > MAX_LOOKAHEAD_MS) {
      return null;
    }

    if (msToStart > 24 * 60 * 60 * 1000) {
      return { stage: "T48H", frequencyMinutes: null };
    }

    if (msToStart > 6 * 60 * 60 * 1000) {
      return { stage: "T24H", frequencyMinutes: 360 };
    }

    if (msToStart > 60 * 60 * 1000) {
      return { stage: "T6H", frequencyMinutes: 60 };
    }

    return { stage: "T60M", frequencyMinutes: 15 };
  }

  private parseStoredForecast(raw: unknown): StoredWeatherForecast | null {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null;
    }

    const value = raw as Partial<StoredWeatherForecast>;
    if (!Array.isArray(value.snapshots)) {
      return null;
    }

    return {
      source: "open-meteo",
      latitude: Number(value.latitude ?? 0),
      longitude: Number(value.longitude ?? 0),
      timezone: String(value.timezone ?? "UTC"),
      lastFetchedAt: String(value.lastFetchedAt ?? ""),
      latestStage: (value.latestStage as WeatherStage | undefined) ?? "T48H",
      matchDateIso: String(value.matchDateIso ?? ""),
      snapshots: value.snapshots as WeatherSnapshot[],
    };
  }

  private isDue(
    existing: StoredWeatherForecast | null,
    policy: PollPolicy,
    now: Date,
  ): boolean {
    if (!existing || !Array.isArray(existing.snapshots)) {
      return true;
    }

    const latestInStage = [...existing.snapshots]
      .reverse()
      .find((snapshot) => snapshot.stage === policy.stage);

    if (!latestInStage) {
      return true;
    }

    if (policy.frequencyMinutes === null) {
      return false;
    }

    const lastFetched = new Date(latestInStage.fetchedAt).getTime();
    const elapsedMs = now.getTime() - lastFetched;
    return elapsedMs >= policy.frequencyMinutes * 60 * 1000;
  }

  private async fetchForecast(input: {
    latitude: number;
    longitude: number;
    matchDate: Date;
    timezone: string | null;
    stage: WeatherStage;
    frequencyMinutes: number | null;
  }): Promise<WeatherSnapshot> {
    const timezone = normalizeTimezone(input.timezone);
    const matchLocalDate = this.toLocalDate(input.matchDate, timezone);
    const matchLocalHourKey = this.toLocalHourKey(input.matchDate, timezone);

    const params = new URLSearchParams({
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      hourly: WEATHER_HOURLY_FIELDS,
      models: "best_match",
      timezone: "auto",
      start_date: matchLocalDate,
      end_date: matchLocalDate,
    });

    const { data } = await axios.get<OpenMeteoResponse>(
      `${OPEN_METEO_URL}?${params.toString()}`,
      { timeout: 15_000 },
    );

    const index = this.findClosestHourIndex(
      data.hourly.time,
      matchLocalHourKey,
    );
    const start = Math.max(0, index - WINDOW_HOURS_EACH_SIDE);
    const end = Math.min(
      data.hourly.time.length - 1,
      index + WINDOW_HOURS_EACH_SIDE,
    );
    const units = data.hourly_units ?? {};

    const hourlyWindow = [] as WeatherSnapshot["hourlyWindow"];
    for (let i = start; i <= end; i++) {
      hourlyWindow.push({
        time: data.hourly.time[i] ?? "",
        temperatureC: data.hourly.temperature_2m?.[i] ?? null,
        humidityPct: data.hourly.relative_humidity_2m?.[i] ?? null,
        dewPointC: data.hourly.dew_point_2m?.[i] ?? null,
        windSpeedKph: data.hourly.wind_speed_10m?.[i] ?? null,
        windDirectionDeg: data.hourly.wind_direction_10m?.[i] ?? null,
        cloudCoverPct: data.hourly.cloud_cover?.[i] ?? null,
        precipProbabilityPct:
          data.hourly.precipitation_probability?.[i] ?? null,
        rainMm: data.hourly.rain?.[i] ?? null,
      });
    }

    const center = {
      time: data.hourly.time[index] ?? matchLocalHourKey,
      temperatureC: data.hourly.temperature_2m?.[index] ?? null,
      humidityPct: data.hourly.relative_humidity_2m?.[index] ?? null,
      dewPointC: data.hourly.dew_point_2m?.[index] ?? null,
      windSpeedKph: data.hourly.wind_speed_10m?.[index] ?? null,
      windDirectionDeg: data.hourly.wind_direction_10m?.[index] ?? null,
      cloudCoverPct: data.hourly.cloud_cover?.[index] ?? null,
      precipProbabilityPct:
        data.hourly.precipitation_probability?.[index] ?? null,
      rainMm: data.hourly.rain?.[index] ?? null,
    };

    const scores = this.computeScores({
      data,
      index,
      matchDate: input.matchDate,
      timezone,
    });

    return {
      fetchedAt: new Date().toISOString(),
      stage: input.stage,
      frequencyMinutes: input.frequencyMinutes,
      matchLocalHourKey,
      focusWindowHours: WINDOW_HOURS_EACH_SIDE,
      timezone: data.timezone,
      timezoneAbbreviation: data.timezone_abbreviation ?? null,
      units,
      centerHour: center,
      hourlyWindow,
      scores,
    };
  }

  private computeScores(input: {
    data: OpenMeteoResponse;
    index: number;
    matchDate: Date;
    timezone: string;
  }): WeatherScores {
    const { data, index, matchDate, timezone } = input;

    const tempNow = data.hourly.temperature_2m?.[index] ?? null;
    const dewNow = data.hourly.dew_point_2m?.[index] ?? null;
    const humidityNow = data.hourly.relative_humidity_2m?.[index] ?? null;
    const cloudCoverNow = data.hourly.cloud_cover?.[index] ?? null;
    const windNow = data.hourly.wind_speed_10m?.[index] ?? null;

    const dewIndexNow =
      tempNow != null && dewNow != null
        ? Number((tempNow - dewNow).toFixed(2))
        : null;

    let dewBand: DewBand | null = null;
    if (dewIndexNow != null) {
      if (dewIndexNow < 2) dewBand = "HEAVY";
      else if (dewIndexNow <= 5) dewBand = "MEDIUM";
      else dewBand = "LOW";
    }

    const matchStartLocal = this.toLocalDateTimeParts(matchDate, timezone);
    const timeline: WeatherScores["xDewIndex"]["timeline"] = [];
    for (
      let offset = 0;
      offset <= DEW_TIMELINE_HOURS * 60;
      offset += DEW_TIMELINE_INTERVAL_MINUTES
    ) {
      const slotDate = new Date(matchDate.getTime() + offset * 60_000);
      const slotKey = this.toLocalHourMinuteKey(slotDate, timezone);
      const temp = this.interpolateHourlyValue(
        data.hourly.time,
        data.hourly.temperature_2m,
        slotKey,
      );
      const dew = this.interpolateHourlyValue(
        data.hourly.time,
        data.hourly.dew_point_2m,
        slotKey,
      );
      const dewIndex =
        temp != null && dew != null ? Number((temp - dew).toFixed(2)) : null;
      timeline.push({
        time: slotKey,
        approxOver: Math.round((offset / 6) * 10) / 10,
        dewIndex,
      });
    }

    const onset = timeline.find(
      (row) => row.dewIndex != null && row.dewIndex < 3,
    );

    const temperatureNorm = this.norm(tempNow, 40);
    const humidityNorm = this.norm(humidityNow, 100);
    const cloudNorm = this.norm(cloudCoverNow, 100);
    const windNorm = this.norm(windNow, 20);

    const battingEaseScore =
      temperatureNorm != null &&
      humidityNorm != null &&
      cloudNorm != null &&
      windNorm != null
        ? Number(
            (
              temperatureNorm * 0.4 +
              (1 - cloudNorm) * 0.2 +
              (1 - windNorm) * 0.1 +
              (1 - humidityNorm) * 0.3
            ).toFixed(3),
          )
        : null;

    const tempPrev =
      index > 0 ? (data.hourly.temperature_2m?.[index - 1] ?? null) : null;
    const tempGradient =
      tempPrev != null && tempNow != null
        ? Number((Math.abs(tempPrev - tempNow) / 5).toFixed(3))
        : null;

    const swingScore =
      humidityNorm != null && tempGradient != null && windNorm != null
        ? Number(
            (humidityNorm * 0.6 + tempGradient * 0.2 + windNorm * 0.2).toFixed(
              3,
            ),
          )
        : null;

    const daytimeTemp = this.computeDaytimeTemperature(data.hourly);
    const daytimeTempNorm = this.norm(daytimeTemp, 40);
    const pitchMoistureScore =
      daytimeTempNorm != null && humidityNorm != null && cloudNorm != null
        ? Number(
            (
              daytimeTempNorm * 0.5 +
              humidityNorm * 0.3 +
              cloudNorm * 0.2
            ).toFixed(3),
          )
        : null;

    return {
      xDewIndex: {
        value: dewIndexNow,
        band: dewBand,
        timeline,
      },
      xDewOnset: {
        time: onset?.time ?? null,
        approxOver: onset?.approxOver ?? null,
        dewIndex: onset?.dewIndex ?? null,
      },
      xBattingEase: {
        score: battingEaseScore,
        band: this.toBand(battingEaseScore),
      },
      xBallSwing: {
        score: swingScore,
        band: this.toBand(swingScore),
        temperatureGradient: tempGradient,
      },
      xPitchMoisture: {
        score: pitchMoistureScore,
        band: this.toBand(pitchMoistureScore),
      },
    };
  }

  private toBand(score: number | null): WeatherBand | null {
    if (score == null) return null;
    if (score > 0.6) return "HIGH";
    if (score >= 0.4) return "MEDIUM";
    return "LOW";
  }

  private norm(value: number | null, max: number): number | null {
    if (value == null) return null;
    return this.clamp(value / max, 0, 1);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private computeDaytimeTemperature(
    hourly: OpenMeteoResponse["hourly"],
  ): number | null {
    const times = hourly.time ?? [];
    const values = hourly.temperature_2m ?? [];
    const daytime: number[] = [];

    for (let i = 0; i < times.length; i++) {
      const value = values[i];
      if (value == null) continue;
      const hour = Number(times[i]?.slice(11, 13));
      if (Number.isNaN(hour)) continue;
      if (hour >= 12 && hour <= 16) {
        daytime.push(value);
      }
    }

    if (daytime.length === 0) {
      const first = values.find((value) => value != null);
      return first ?? null;
    }

    const avg = daytime.reduce((sum, value) => sum + value, 0) / daytime.length;
    return Number(avg.toFixed(2));
  }

  private interpolateHourlyValue(
    hourlyTimes: string[] | undefined,
    values: number[] | undefined,
    targetHourMinuteKey: string,
  ): number | null {
    if (!hourlyTimes || !values || hourlyTimes.length === 0) {
      return null;
    }

    const targetMinutes = this.minutesFromHourMinuteKey(targetHourMinuteKey);
    const points: Array<{ minutes: number; value: number }> = [];

    for (let i = 0; i < hourlyTimes.length; i++) {
      const value = values[i];
      if (value == null) continue;
      points.push({
        minutes: this.minutesFromHourMinuteKey(hourlyTimes[i] ?? ""),
        value,
      });
    }

    if (points.length === 0) return null;

    const exact = points.find((point) => point.minutes === targetMinutes);
    if (exact) return Number(exact.value.toFixed(2));

    let prev: { minutes: number; value: number } | null = null;
    let next: { minutes: number; value: number } | null = null;

    for (const point of points) {
      if (point.minutes < targetMinutes) {
        if (!prev || point.minutes > prev.minutes) prev = point;
        continue;
      }
      if (point.minutes > targetMinutes) {
        if (!next || point.minutes < next.minutes) next = point;
      }
    }

    if (prev && next && next.minutes !== prev.minutes) {
      const t = (targetMinutes - prev.minutes) / (next.minutes - prev.minutes);
      return Number((prev.value + (next.value - prev.value) * t).toFixed(2));
    }

    if (prev) return Number(prev.value.toFixed(2));
    if (next) return Number(next.value.toFixed(2));
    return null;
  }

  private toLocalDateTimeParts(
    date: Date,
    timezone: string,
  ): {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
  } {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const byType = new Map(parts.map((part) => [part.type, part.value]));
    return {
      year: byType.get("year") ?? "1970",
      month: byType.get("month") ?? "01",
      day: byType.get("day") ?? "01",
      hour: byType.get("hour") ?? "00",
      minute: byType.get("minute") ?? "00",
    };
  }

  private toLocalHourMinuteKey(date: Date, timezone: string): string {
    const parts = this.toLocalDateTimeParts(date, timezone);
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  }

  private minutesFromHourMinuteKey(hourMinuteKey: string): number {
    const hour = Number(hourMinuteKey.slice(11, 13));
    const minute = Number(hourMinuteKey.slice(14, 16));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return 0;
    }
    return hour * 60 + minute;
  }

  private mergeSnapshot(
    existing: StoredWeatherForecast | null,
    input: {
      latitude: number;
      longitude: number;
      matchDateIso: string;
      snapshot: WeatherSnapshot;
    },
  ): StoredWeatherForecast {
    const snapshots = [...(existing?.snapshots ?? []), input.snapshot].slice(
      -40,
    );
    return {
      source: "open-meteo",
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.snapshot.timezone,
      lastFetchedAt: input.snapshot.fetchedAt,
      latestStage: input.snapshot.stage,
      matchDateIso: input.matchDateIso,
      snapshots,
    };
  }

  private toLocalDate(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  }

  private toLocalHourKey(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const byType = new Map(parts.map((part) => [part.type, part.value]));
    const year = byType.get("year") ?? "1970";
    const month = byType.get("month") ?? "01";
    const day = byType.get("day") ?? "01";
    const hour = byType.get("hour") ?? "00";
    return `${year}-${month}-${day}T${hour}:00`;
  }

  private findClosestHourIndex(
    hourlyTimes: string[],
    targetHourKey: string,
  ): number {
    const exact = hourlyTimes.findIndex((value) => value === targetHourKey);
    if (exact >= 0) {
      return exact;
    }

    if (hourlyTimes.length === 0) {
      return 0;
    }

    const targetHour = Number(targetHourKey.slice(11, 13));
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < hourlyTimes.length; i++) {
      const hour = Number(hourlyTimes[i]?.slice(11, 13));
      const distance = Math.abs(targetHour - hour);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }
}
