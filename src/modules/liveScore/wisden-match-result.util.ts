import { MatchResult } from "../../../generated/prisma/client.js";
import type { WisdenScorecardResponse } from "../../common/types/wisden.types.js";

function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function deriveWisdenMatchResult(scorecard: WisdenScorecardResponse): {
  summary: string | null;
  outcome: MatchResult;
} {
  const status = (scorecard.match_status ?? "").toLowerCase();
  if (status.includes("abandon") || status.includes("no result")) {
    return {
      summary: "Match abandoned",
      outcome: MatchResult.ABANDONED,
    };
  }

  const innings = [...(scorecard.innings ?? [])]
    .filter((inn) => Number.isFinite(Number(inn.batting_team_id)))
    .sort((a, b) => (a.innings_number ?? 0) - (b.innings_number ?? 0));

  if (innings.length < 2) {
    return { summary: null, outcome: MatchResult.PENDING };
  }

  const first = innings[0];
  const second = innings[1];
  if (!first || !second) {
    return { summary: null, outcome: MatchResult.PENDING };
  }

  const firstRuns = toFiniteNumber(first.runs ?? first.score?.runs, 0);
  const secondRuns = toFiniteNumber(second.runs ?? second.score?.runs, 0);

  const team1Id = toFiniteNumber(scorecard.team1?.id, NaN);
  const team2Id = toFiniteNumber(scorecard.team2?.id, NaN);

  const nameById = new Map<number, string>([
    [
      team1Id,
      scorecard.team1?.name?.trim() ||
        scorecard.team1?.abbreviation ||
        "Team 1",
    ],
    [
      team2Id,
      scorecard.team2?.name?.trim() ||
        scorecard.team2?.abbreviation ||
        "Team 2",
    ],
  ]);

  if (secondRuns > firstRuns) {
    const winnerId = toFiniteNumber(second.batting_team_id, NaN);
    const winnerName =
      nameById.get(winnerId) ?? second.batting_team_name ?? "Team";
    const wicketsLost = toFiniteNumber(
      second.wickets ?? second.score?.wickets,
      0,
    );
    const wicketsRemaining = Math.max(0, 10 - wicketsLost);
    const outcome =
      winnerId === team1Id
        ? MatchResult.HOME_WIN
        : winnerId === team2Id
          ? MatchResult.AWAY_WIN
          : MatchResult.PENDING;

    return {
      summary: `${winnerName} won by ${pluralize(wicketsRemaining, "wicket", "wickets")}`,
      outcome,
    };
  }

  if (firstRuns > secondRuns) {
    const winnerId = toFiniteNumber(first.batting_team_id, NaN);
    const winnerName =
      nameById.get(winnerId) ?? first.batting_team_name ?? "Team";
    const margin = firstRuns - secondRuns;
    const outcome =
      winnerId === team1Id
        ? MatchResult.HOME_WIN
        : winnerId === team2Id
          ? MatchResult.AWAY_WIN
          : MatchResult.PENDING;

    return {
      summary: `${winnerName} won by ${pluralize(margin, "run", "runs")}`,
      outcome,
    };
  }

  return {
    summary: "Match tied",
    outcome: MatchResult.PENDING,
  };
}

export function withDerivedMatchResult(scorecard: WisdenScorecardResponse): {
  scorecard: WisdenScorecardResponse;
  outcome: MatchResult;
} {
  const derived = deriveWisdenMatchResult(scorecard);
  const resultText = derived.summary ?? scorecard.match_result;

  const nextScorecard: WisdenScorecardResponse = resultText
    ? { ...scorecard, match_result: resultText }
    : { ...scorecard };

  return {
    scorecard: nextScorecard,
    outcome: derived.outcome,
  };
}
