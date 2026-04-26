/**
 * Scoring Lab (alpha) — config-driven points computation.
 *
 * Operates on FantasyPlayerMatchStats rows stored in the DB (not raw Wisden
 * commentary). This is a lighter-weight replica of the production scoring
 * engine in fantasy-scoring.service.ts#computePoints.
 *
 * Differences vs. production scoring:
 *   - lbw_bowled_bonus is NOT computed — we don't persist lbw/bowled splits
 *     in FantasyPlayerMatchStats. The field is ignored from the config.
 *   - runOutAssist is used as the combined (thrower + catcher) count.
 *   - duck_penalty is approximated as `runs === 0 && ballsFaced > 0` (we
 *     don't persist gotOut; this is a close approximation — misses not-out-
 *     on-zero cases, which are rare).
 */

export type FantasyPointSystem = {
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
    lbw_bowled_bonus: number; // ignored in sandbox (no data stored)
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

export interface StoredPlayerMatchStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  maidens: number;
  dotBalls: number;
  catches: number;
  stumpings: number;
  runOutDirect: number;
  runOutAssist: number;
  played: boolean;
}

export function computeCustomPoints(
  s: StoredPlayerMatchStats,
  cfg: FantasyPointSystem,
): { points: number; breakdown: Record<string, number> } {
  const b: Record<string, number> = {};
  let pts = 0;

  const add = (key: string, val: number) => {
    if (val !== 0) b[key] = (b[key] ?? 0) + val;
    pts += val;
  };

  if (s.played) {
    add("playing", cfg.other.playing_11_bonus);
  }

  // Batting
  add("runs", s.runs * cfg.batting.runs);
  add("fourBonus", s.fours * cfg.batting.four_bonus);
  add("sixBonus", s.sixes * cfg.batting.six_bonus);
  if (s.runs >= 100) add("centuryBonus", cfg.batting["100_runs_bonus"]);
  else if (s.runs >= 75) add("seventyFiveBonus", cfg.batting["75_runs_bonus"]);
  else if (s.runs >= 50) add("fiftyBonus", cfg.batting["50_runs_bonus"]);
  else if (s.runs >= 25) add("twentyFiveBonus", cfg.batting["25_runs_bonus"]);

  const batted = s.ballsFaced > 0;
  if (batted && s.runs === 0) {
    // Approximation of duck penalty (we don't persist gotOut).
    add("duckPenalty", cfg.batting.duck_penalty);
  }

  if (batted && s.ballsFaced >= 10) {
    const sr = (s.runs * 100) / s.ballsFaced;
    const tiers = cfg.batting.strike_rate;
    if (sr < 50) add("strikeRate", tiers.less_than_50);
    else if (sr < 60) add("strikeRate", tiers["50_to_59.99"]);
    else if (sr < 70) add("strikeRate", tiers["60_to_69.99"]);
    else if (sr < 130) add("strikeRate", tiers["70_to_129.99"]);
    else if (sr < 150) add("strikeRate", tiers["130_to_149.99"]);
    else if (sr < 170) add("strikeRate", tiers["150_to_169.99"]);
    else add("strikeRate", tiers["170_and_above"]);
  }

  // Bowling
  add("wickets", s.wickets * cfg.bowling.wicket_bonus);
  add("maidenOverBonus", s.maidens * cfg.bowling.maiden_over_bonus);
  add("dotBallBonus", s.dotBalls * cfg.bowling.dot_ball_bonus);
  if (s.wickets >= 5) add("fiveWicketHaulBonus", cfg.bowling.five_wicket_haul_bonus);
  else if (s.wickets >= 4) add("fourWicketHaulBonus", cfg.bowling.four_wicket_haul_bonus);
  else if (s.wickets >= 3) add("threeWicketHaulBonus", cfg.bowling.three_wicket_haul_bonus);

  if (s.ballsBowled >= 12) {
    const econ = (s.runsConceded * 6) / s.ballsBowled;
    const tiers = cfg.bowling.economy_rate;
    if (econ < 5) add("economyRate", tiers.less_than_5);
    else if (econ < 6) add("economyRate", tiers["5_to_5.99"]);
    else if (econ < 7) add("economyRate", tiers["6_to_6.99"]);
    else if (econ < 10) add("economyRate", tiers["7_to_9.99"]);
    else if (econ < 11) add("economyRate", tiers["10_to_10.99"]);
    else if (econ < 12) add("economyRate", tiers["11_to_11.99"]);
    else add("economyRate", tiers["12_and_above"]);
  }

  // Fielding
  add("catches", s.catches * cfg.fielding.catch);
  add("stumpings", s.stumpings * cfg.fielding.stumping);
  add("runOutDirect", s.runOutDirect * cfg.fielding.run_out_direct);
  add("runOutAssists", s.runOutAssist * cfg.fielding.run_out_multiple);
  if (s.catches >= 3) add("catchBonus", cfg.fielding.catch_bonus);

  return { points: pts, breakdown: b };
}
