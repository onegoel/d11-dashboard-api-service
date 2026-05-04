import { PrismaClient } from "../../generated/prisma/client.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

type VenueDetailed = {
  ground: string;
  city: string;
  region?: string;
  country: string;
  timezone?: string;
  established?: number;
  capacity?: string | number;
  latitude?: number;
  longitude?: number;
  altitudeMeters?: number;
  knownAs?: string;
  homeTeam?: string;
  floodlights?: boolean;
  imageId?: string;
  cricbuzzGroundId?: number;
  description?: string;
  nickname?: string;
};

function parseCapacity(value?: string | number): number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function seedGrounds(prisma: PrismaClient) {
  console.log("Seeding cricket grounds from venuesDetailed.json...");

  const filePath = path.join(
    process.cwd(),
    "prisma/data/cricbuzz/venuesDetailed.json",
  );

  try {
    const raw = await readFile(filePath, "utf8");
    const data = JSON.parse(raw) as { detailed?: VenueDetailed[] };

    if (!data.detailed || !Array.isArray(data.detailed)) {
      console.log("No detailed venues found in venuesDetailed.json");
      return;
    }

    let created = 0;
    let updated = 0;

    for (const venue of data.detailed) {
      const groundData = {
        name: venue.ground,
        city: venue.city,
        country: venue.country,
        region: venue.region || null,
        knownAs: venue.knownAs || null,
        latitude: venue.latitude || null,
        longitude: venue.longitude || null,
        altitudeMeters: venue.altitudeMeters || null,
        capacity: parseCapacity(venue.capacity),
        establishedYear: venue.established || null,
        timezone: venue.timezone || null,
        hasFloodlights: venue.floodlights || false,
        cricbuzzGroundId: venue.cricbuzzGroundId || null,
        description: venue.description || null,
        nickname: venue.nickname || null,
      };

      const existing = venue.cricbuzzGroundId
        ? await prisma.ground.findUnique({
            where: { cricbuzzGroundId: venue.cricbuzzGroundId },
          })
        : await prisma.ground.findFirst({
            where: {
              name: venue.ground,
              city: venue.city,
            },
          });

      if (existing) {
        await prisma.ground.update({
          where: { id: existing.id },
          data: groundData,
        });
        updated++;
      } else {
        await prisma.ground.create({
          data: groundData,
        });
        created++;
      }
    }

    console.log(
      `Grounds seeding completed: ${data.detailed.length} venues processed (${created} created, ${updated} updated)`,
    );
  } catch (error) {
    console.error("Error seeding grounds:", error);
    throw error;
  }
}
