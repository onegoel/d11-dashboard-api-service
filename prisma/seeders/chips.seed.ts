import { ChipCode, PrismaClient } from "../../generated/prisma/client.js";

type ChipSeed = {
  code: ChipCode;
  name: string;
  description: string;
  multiplier: number;
  maxUsesPerSeason: number;
  effectWindowMatches: number;
  requiresBottomHalf: boolean;
  usesSecondaryTeamScore: boolean;
};

const chipSeeds: ChipSeed[] = [
  {
    code: ChipCode.DOUBLE_TEAM,
    name: "Double Team",
    description:
      "Submit two Dream11 scores for a match. The higher score is used for leaderboard ranking.",
    multiplier: 1,
    maxUsesPerSeason: 2,
    effectWindowMatches: 1,
    requiresBottomHalf: false,
    usesSecondaryTeamScore: true,
  },
  {
    code: ChipCode.TEAM_FORM,
    name: "Team Form",
    description:
      "Select a team. For the next 3 matches: +5 points if they win, -2 points if they lose. No points for abandoned matches.",
    multiplier: 1,
    maxUsesPerSeason: 2,
    effectWindowMatches: 3,
    requiresBottomHalf: false,
    usesSecondaryTeamScore: false,
  },
  {
    code: ChipCode.SWAPPER,
    name: "Swapper",
    description:
      "Swap out a player during the innings break. Points calculated manually.",
    multiplier: 1,
    maxUsesPerSeason: 2,
    effectWindowMatches: 1,
    requiresBottomHalf: false,
    usesSecondaryTeamScore: false,
  },
  {
    code: ChipCode.ANCHOR_PLAYER,
    name: "Anchor Player",
    description:
      "Select a cricketer in the match. If they score 50+ points, their D11 points are 1.1x. Points calculated manually.",
    multiplier: 1,
    maxUsesPerSeason: 2,
    effectWindowMatches: 1,
    requiresBottomHalf: false,
    usesSecondaryTeamScore: false,
  },
];

export async function seedChipTypes(prisma: PrismaClient) {
  console.log("Seeding chip types...");

  for (const chip of chipSeeds) {
    await prisma.chipType.upsert({
      where: {
        code: chip.code,
      },
      update: {
        name: chip.name,
        description: chip.description,
        multiplier: chip.multiplier,
        maxUsesPerSeason: chip.maxUsesPerSeason,
        effectWindowMatches: chip.effectWindowMatches,
        requiresBottomHalf: chip.requiresBottomHalf,
        usesSecondaryTeamScore: chip.usesSecondaryTeamScore,
      },
      create: chip,
    });
  }
}
