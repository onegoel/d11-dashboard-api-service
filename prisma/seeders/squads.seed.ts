import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../../generated/prisma/client.js";

type WisdenSquadsResponse = {
  teams: Array<{
    team_id: number;
    team_name: string;
    players: Array<{
      batting_hand: string | null;
      bowling_hand: string | null;
      is_keeper: number;
      player_id: number;
      player_image: string | null;
      player_known_as: string;
      player_name: string;
      player_role: string;
    }>;
  }>;
};

const WISDEN_SQUADS_PATH = path.join(
  process.cwd(),
  "prisma/data/wisden/squads.json",
);

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? displayName;
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

function mapWisdenRoleToFantasyRole(
  role: string,
  isKeeper: number,
): "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKET_KEEPER" {
  if (isKeeper) return "WICKET_KEEPER";

  const normalized = role.toLowerCase().trim();
  if (normalized.includes("keeper")) return "WICKET_KEEPER";
  if (normalized.includes("allrounder") || normalized.includes("allround")) {
    return "ALL_ROUNDER";
  }
  if (normalized.includes("bowler")) return "BOWLER";
  return "BATSMAN";
}

export async function seedSquads(prisma: PrismaClient) {
  console.log("Seeding Wisden squads...");

  const raw = await readFile(WISDEN_SQUADS_PATH, "utf8");
  const payload = JSON.parse(raw) as WisdenSquadsResponse;

  let teamsSynced = 0;
  let playersUpserted = 0;
  let missingTeams = 0;

  for (const wisdenTeam of payload.teams) {
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { wisdenTeamId: String(wisdenTeam.team_id) },
          { name: wisdenTeam.team_name },
        ],
      },
    });

    if (!team) {
      console.warn(`No DB team found for ${wisdenTeam.team_name}`);
      missingTeams++;
      continue;
    }

    if (team.wisdenTeamId !== String(wisdenTeam.team_id)) {
      await prisma.team.update({
        where: { id: team.id },
        data: { wisdenTeamId: String(wisdenTeam.team_id) },
      });
      teamsSynced++;
    }

    for (const player of wisdenTeam.players) {
      const displayName = player.player_known_as || player.player_name;
      const { firstName, lastName } = splitDisplayName(displayName);
      const role = mapWisdenRoleToFantasyRole(
        player.player_role,
        player.is_keeper,
      );

      await prisma.fantasyPlayer.upsert({
        where: { wisdenPlayerId: String(player.player_id) },
        update: {
          firstName,
          lastName,
          displayName,
          shortName: player.player_name,
          role,
          teamId: team.id,
          teamWisdenId: String(wisdenTeam.team_id),
          battingHand: player.batting_hand,
          bowlingHand: player.bowling_hand,
          photoUrl: player.player_image,
          isActive: true,
        },
        create: {
          wisdenPlayerId: String(player.player_id),
          firstName,
          lastName,
          displayName,
          shortName: player.player_name,
          role,
          teamId: team.id,
          teamWisdenId: String(wisdenTeam.team_id),
          battingHand: player.batting_hand,
          bowlingHand: player.bowling_hand,
          photoUrl: player.player_image,
          isActive: true,
        },
      });

      playersUpserted++;
    }
  }

  console.log(
    `Squads seeded: teamsSynced=${teamsSynced}, playersUpserted=${playersUpserted}, missingTeams=${missingTeams}`,
  );
}
