import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { prisma, pool } from "../client.js";
import fantasyIplSquads from "./fantasyIplSquads.json" with { type: "json" };

type TaggedFantasyPlayer = {
  Id?: number | string;
  Name?: string;
  ShortName?: string;
};

const IPL_FANTASY_PHOTO_BASE_URL =
  "https://fantasy.iplt20.com/classic/static-assets/build/images/players/onpitch";

function buildPhotoUrl(iplFantasyId: string): string {
  return `${IPL_FANTASY_PHOTO_BASE_URL}/${iplFantasyId}.png`;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function seedPlayerPhotos(prismaClient: PrismaClient) {
  const isProd =
    process.env.SEED_ENV === "production" ||
    process.env.NODE_ENV === "production";
  console.log(
    isProd
      ? "Seeding IPL fantasy IDs (production mode: photoUrl untouched)..."
      : "Seeding IPL fantasy IDs and player photos (local mode)...",
  );

  const taggedPlayers = (fantasyIplSquads as TaggedFantasyPlayer[])
    .map((player) => {
      const idRaw = player.Id;
      const iplFantasyId =
        idRaw === undefined || idRaw === null ? "" : String(idRaw).trim();
      const name = (player.Name ?? "").trim();
      const shortName = (player.ShortName ?? "").trim();
      return {
        iplFantasyId,
        name,
        shortName,
      };
    })
    .filter((player) => player.iplFantasyId.length > 0);

  const ids = Array.from(
    new Set(taggedPlayers.map((player) => player.iplFantasyId)),
  );

  if (ids.length === 0) {
    console.warn("No valid Id values found in fantasyIplSquads.json.");
    return;
  }

  const dbPlayers = await prismaClient.$queryRaw<
    Array<{
      id: string;
      displayName: string;
      shortName: string | null;
      iplFantasyId: string | null;
      photoUrl: string | null;
    }>
  >(Prisma.sql`
		SELECT
			"id",
			"displayName",
			"shortName",
			"iplFantasyId",
			"photoUrl"
		FROM "FantasyPlayer"
	`);

  const nameIndex = new Map<string, typeof dbPlayers>();
  for (const player of dbPlayers) {
    const keys = [player.displayName, player.shortName ?? ""]
      .map((v) => normalizeName(v))
      .filter((v) => v.length > 0);
    for (const key of keys) {
      const existing = nameIndex.get(key);
      if (existing) {
        existing.push(player);
      } else {
        nameIndex.set(key, [player]);
      }
    }
  }

  const idOwner = new Map<string, string>();
  for (const player of dbPlayers) {
    if (player.iplFantasyId) {
      idOwner.set(player.iplFantasyId, player.id);
    }
  }

  const plannedIdUpdates: Array<{ playerId: string; iplFantasyId: string }> =
    [];
  const plannedPlayerIds = new Set<string>();
  const plannedFantasyIds = new Set<string>();
  let unmatchedByName = 0;
  let ambiguousByName = 0;
  let idConflictCount = 0;

  for (const tagged of taggedPlayers) {
    const keys = [tagged.name, tagged.shortName]
      .map((v) => normalizeName(v))
      .filter((v) => v.length > 0);
    const candidates = new Map<string, (typeof dbPlayers)[number]>();
    for (const key of keys) {
      for (const candidate of nameIndex.get(key) ?? []) {
        candidates.set(candidate.id, candidate);
      }
    }

    if (candidates.size === 0) {
      unmatchedByName += 1;
      continue;
    }

    if (candidates.size > 1) {
      ambiguousByName += 1;
      continue;
    }

    const player = candidates.values().next().value;
    if (!player) {
      unmatchedByName += 1;
      continue;
    }

    if (
      plannedPlayerIds.has(player.id) ||
      plannedFantasyIds.has(tagged.iplFantasyId)
    ) {
      continue;
    }

    const existingOwnerId = idOwner.get(tagged.iplFantasyId);
    if (existingOwnerId && existingOwnerId !== player.id) {
      idConflictCount += 1;
      continue;
    }

    if (player.iplFantasyId === tagged.iplFantasyId) {
      continue;
    }

    plannedIdUpdates.push({
      playerId: player.id,
      iplFantasyId: tagged.iplFantasyId,
    });
    plannedPlayerIds.add(player.id);
    plannedFantasyIds.add(tagged.iplFantasyId);
  }

  for (const update of plannedIdUpdates) {
    await prismaClient.$executeRaw(
      Prisma.sql`
				UPDATE "FantasyPlayer"
				SET "iplFantasyId" = ${update.iplFantasyId}
				WHERE "id" = ${update.playerId}
			`,
    );
  }

  let photoUpdatesCount = 0;
  if (!isProd) {
    const photoTargets = await prismaClient.$queryRaw<
      Array<{
        id: string;
        iplFantasyId: string | null;
        photoUrl: string | null;
      }>
    >(Prisma.sql`
			SELECT
				"id",
				"iplFantasyId",
				"photoUrl"
			FROM "FantasyPlayer"
			WHERE "iplFantasyId" IN (${Prisma.join(ids)})
		`);

    const updates = photoTargets
      .map((player) => {
        const fantasyId = player.iplFantasyId;
        if (!fantasyId) return null;

        const nextPhotoUrl = buildPhotoUrl(fantasyId);
        if (player.photoUrl === nextPhotoUrl) return null;

        return prismaClient.fantasyPlayer.update({
          where: { id: player.id },
          data: { photoUrl: nextPhotoUrl },
        });
      })
      .filter(
        (query): query is ReturnType<PrismaClient["fantasyPlayer"]["update"]> =>
          Boolean(query),
      );

    if (updates.length > 0) {
      await prismaClient.$transaction(updates);
    }

    photoUpdatesCount = updates.length;
  }

  const finalRows = await prismaClient.$queryRaw<
    Array<{ iplFantasyId: string | null }>
  >(
    Prisma.sql`
			SELECT "iplFantasyId"
			FROM "FantasyPlayer"
			WHERE "iplFantasyId" IN (${Prisma.join(ids)})
		`,
  );

  const foundIdSet = new Set(
    finalRows
      .map((row) => row.iplFantasyId)
      .filter((id): id is string => Boolean(id)),
  );
  const missingCount = ids.filter((id) => !foundIdSet.has(id)).length;

  console.log(
    `Player photo seeding complete. scanned=${ids.length}, idUpserts=${plannedIdUpdates.length}, photoUpdates=${photoUpdatesCount}, unmatchedByName=${unmatchedByName}, ambiguousByName=${ambiguousByName}, idConflicts=${idConflictCount}, missingInDb=${missingCount}`,
  );
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seedPlayerPhotos(prisma)
    .then(async () => {
      await prisma.$disconnect();
      await pool.end();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    });
}
