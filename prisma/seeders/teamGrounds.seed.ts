import { PrismaClient } from "../../generated/prisma/client.js";

type TeamGroundMapping = {
  shortCode: string;
  preferredGroundName: string;
};

const TEAM_HOME_GROUND_MAPPINGS: TeamGroundMapping[] = [
  { shortCode: "MI", preferredGroundName: "Wankhede Stadium" },
  { shortCode: "CSK", preferredGroundName: "MA Chidambaram Stadium" },
  { shortCode: "RCB", preferredGroundName: "M.Chinnaswamy Stadium" },
  { shortCode: "KKR", preferredGroundName: "Eden Gardens" },
  { shortCode: "DC", preferredGroundName: "Arun Jaitley Stadium" },
  { shortCode: "RR", preferredGroundName: "Sawai Mansingh Stadium" },
  {
    shortCode: "SRH",
    preferredGroundName: "Rajiv Gandhi International Stadium",
  },
  {
    shortCode: "PBKS",
    preferredGroundName:
      "Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur",
  },
  { shortCode: "GT", preferredGroundName: "Narendra Modi Stadium" },
  {
    shortCode: "LSG",
    preferredGroundName:
      "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium",
  },
];

function normalizeVenueText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(stadium|cricket|ground|international)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findBestGroundMatch(
  grounds: Array<{ id: number; name: string }>,
  preferredGroundName: string,
): { id: number; name: string } | null {
  const preferred = normalizeVenueText(preferredGroundName);

  const exact = grounds.find(
    (ground) => normalizeVenueText(ground.name) === preferred,
  );
  if (exact) return exact;

  const substring = grounds.find((ground) => {
    const normalized = normalizeVenueText(ground.name);
    return normalized.includes(preferred) || preferred.includes(normalized);
  });
  if (substring) return substring;

  return null;
}

export async function seedTeamHomeGrounds(prisma: PrismaClient) {
  console.log("Linking teams to home grounds...");

  const grounds = await prisma.ground.findMany({
    select: { id: true, name: true },
  });

  if (grounds.length === 0) {
    console.log("No grounds found. Skipping team home ground linking.");
    return;
  }

  let linked = 0;

  for (const mapping of TEAM_HOME_GROUND_MAPPINGS) {
    const ground = findBestGroundMatch(grounds, mapping.preferredGroundName);
    if (!ground) {
      console.warn(
        `Could not find ground match for team ${mapping.shortCode}: ${mapping.preferredGroundName}`,
      );
      continue;
    }

    await prisma.team.updateMany({
      where: { shortCode: mapping.shortCode },
      data: { homeGroundId: ground.id },
    });
    linked++;
  }

  console.log(`Linked ${linked} teams to home grounds.`);
}
