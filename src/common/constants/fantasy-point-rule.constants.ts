import { readFileSync } from "node:fs";
import path from "node:path";

type FantasyPointSystem = {
  batting: {
    runs: number;
    four_bonus: number;
    six_bonus: number;
    "25_runs_bonus": number;
    "50_runs_bonus": number;
    "75_runs_bonus": number;
    "100_runs_bonus": number;
    duck_penalty: number;
    strike_rate: {
      less_than_50: number;
      "50_to_59.99": number;
      "60_to_69.99": number;
      "70_to_129.99": number;
      "130_to_149.99": number;
      "150_to_169.99": number;
      "170_and_above": number;
    };
  };
  bowling: {
    dot_ball_bonus: number;
    wicket_bonus: number;
    maiden_over_bonus: number;
    lbw_bowled_bonus: number;
    three_wicket_haul_bonus: number;
    four_wicket_haul_bonus: number;
    five_wicket_haul_bonus: number;
    economy_rate: {
      less_than_5: number;
      "5_to_5.99": number;
      "6_to_6.99": number;
      "7_to_9.99": number;
      "10_to_10.99": number;
      "11_to_11.99": number;
      "12_and_above": number;
    };
  };
  fielding: {
    catch: number;
    catch_bonus: number;
    stumping: number;
    run_out_direct: number;
    run_out_multiple: number;
  };
  other: {
    playing_11_bonus: number;
    captain_multiplier: number;
    vice_captain_multiplier: number;
  };
};

const pointsSystemPath = path.join(
  process.cwd(),
  "prisma/data/pointsSystem.json",
);

export const MY11_T20_POINT_RULE_NAME = "pointsSystem.json" as const;

export const FANTASY_T20_POINT_SYSTEM = JSON.parse(
  readFileSync(pointsSystemPath, "utf8"),
) as FantasyPointSystem;

export const MY11_T20_CAPTAIN_MULTIPLIER =
  FANTASY_T20_POINT_SYSTEM.other.captain_multiplier;
export const MY11_T20_VICE_CAPTAIN_MULTIPLIER =
  FANTASY_T20_POINT_SYSTEM.other.vice_captain_multiplier;

export const MY11_T20_POINT_RULE_ACTIONS = {
  batting: [
    "run",
    "bonus4",
    "bonus6",
    "bonus25Runs",
    "bonus50Runs",
    "bonus75Runs",
    "bonus100Runs",
    "dismissalForDuck",
    "bonusHattrick4",
    "bonusHattrick6",
  ],
  bowling: [
    "wicket",
    "maidenOverBonus",
    "bonus2WicketHaul",
    "bonus3WicketHaul",
    "bonus4WicketHaul",
    "bonus5WicketHaul",
    "hattrickBonus",
    "lbwBonus",
    "bowledBonus",
    "dotballBonus",
    "bonus3dotball",
  ],
  fielding: [
    "catchBonus",
    "stumping",
    "runOutDirect",
    "runOutThrower",
    "runOutCatcher",
    "bonus3Catch",
    "bonus4Catch",
    "bonus5Catch",
  ],
  strikeRate: [
    "srLessThan50",
    "sr50To59P99",
    "sr60To69P99",
    "sr70To74P99",
    "sr75To99P99",
    "sr100To129P99",
    "sr130To149P99",
    "sr150To169P99",
    "sr170To199P99",
    "sr200Plus",
  ],
  economyRate: [
    "erLessThan3",
    "er3To4P49",
    "er4P5To4P99",
    "er5To5P99",
    "er6To6P99",
    "er7To7P49",
    "er7P5To8P99",
    "er9To9P99",
    "er10To10P99",
    "er11To11P99",
    "er12Plus",
  ],
} as const;
