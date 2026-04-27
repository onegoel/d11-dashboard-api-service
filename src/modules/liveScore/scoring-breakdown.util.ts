import type {
  WisdenCommentaryResponse,
  WisdenScorecardResponse,
  WisdenScorecardInnings,
} from "../../common/types/wisden.types.js";

// T20 phase definitions (over_number is 1-indexed in Wisden bbb)
const POWERPLAY_OVERS: [number, number] = [1, 6];
const MIDDLE_OVERS: [number, number] = [7, 15];
const FINAL_OVERS: [number, number] = [16, 20];

export interface PhaseStats {
  runs: number;
  wickets: number;
  legalBalls: number;
}

export interface InningsScoringBreakdown {
  innings_number: number;
  batting_team_id: number | null;
  batting_team_name?: string;
  batting_team_short?: string;
  powerPlay: PhaseStats;
  middleOvers: PhaseStats;
  finalOvers: PhaseStats;
  fours: number;
  sixes: number;
  runsInBoundaries: number;
  dots: number;
  legalBalls: number;
  dotBallPct: number;
  runsInExtras: number;
  totalRuns: number;
  totalWickets: number;
}

export interface ScoringBreakdownResponse {
  match_status?: string;
  team1?: { id: number; name?: string; abbreviation?: string };
  team2?: { id: number; name?: string; abbreviation?: string };
  innings: InningsScoringBreakdown[];
}

interface InningsScoreFields {
  runs?: number;
  wickets?: number;
  byes?: number;
  legbyes?: number;
  wides?: number;
  noballs?: number;
  total_fours?: number;
  total_sixes?: number;
}

interface CommentaryBall {
  runs?: number;
  scoring?: string;
}

interface CommentaryOver {
  over_number?: number;
  balls?: CommentaryBall[];
}

interface CommentaryInnings {
  innings_number: number;
  bbb?: CommentaryOver[];
}

function emptyPhase(): PhaseStats {
  return { runs: 0, wickets: 0, legalBalls: 0 };
}

function pickPhase(
  out: InningsScoringBreakdown,
  overNumber: number,
): PhaseStats | null {
  if (overNumber >= POWERPLAY_OVERS[0] && overNumber <= POWERPLAY_OVERS[1])
    return out.powerPlay;
  if (overNumber >= MIDDLE_OVERS[0] && overNumber <= MIDDLE_OVERS[1])
    return out.middleOvers;
  if (overNumber >= FINAL_OVERS[0] && overNumber <= FINAL_OVERS[1])
    return out.finalOvers;
  return null;
}

function isWideOrNoBall(scoring: string): boolean {
  const s = scoring.toLowerCase();
  // "W" alone is a wicket; "wd"/"1wd" is a wide
  if (s === "w") return false;
  return s.includes("w") || s.includes("n");
}

function isWicket(scoring: string): boolean {
  return scoring === "W";
}

function buildEmptyInnings(
  innings_number: number,
  batting_team_id: number | null,
  batting_team_name?: string,
): InningsScoringBreakdown {
  return {
    innings_number,
    batting_team_id,
    batting_team_name,
    powerPlay: emptyPhase(),
    middleOvers: emptyPhase(),
    finalOvers: emptyPhase(),
    fours: 0,
    sixes: 0,
    runsInBoundaries: 0,
    dots: 0,
    legalBalls: 0,
    dotBallPct: 0,
    runsInExtras: 0,
    totalRuns: 0,
    totalWickets: 0,
  };
}

function applyScorecardTotals(
  out: InningsScoringBreakdown,
  innings: WisdenScorecardInnings,
): void {
  const score = (innings.score ?? {}) as InningsScoreFields;
  const totalRuns = innings.runs ?? score.runs ?? 0;
  const totalWickets = innings.wickets ?? score.wickets ?? 0;
  out.totalRuns = totalRuns;
  out.totalWickets = totalWickets;

  // Boundaries: prefer score totals, else sum batting[]
  const fours =
    score.total_fours ??
    (innings.batting ?? []).reduce((sum, b) => sum + (b.fours ?? 0), 0);
  const sixes =
    score.total_sixes ??
    (innings.batting ?? []).reduce((sum, b) => sum + (b.sixes ?? 0), 0);
  out.fours = fours;
  out.sixes = sixes;
  out.runsInBoundaries = fours * 4 + sixes * 6;

  // Extras: byes + legbyes + wides + noballs
  out.runsInExtras =
    (score.byes ?? 0) +
    (score.legbyes ?? 0) +
    (score.wides ?? 0) +
    (score.noballs ?? 0);
}

function applyCommentaryPhases(
  out: InningsScoringBreakdown,
  commentaryInnings: CommentaryInnings,
): void {
  let dots = 0;
  let legal = 0;

  for (const over of commentaryInnings.bbb ?? []) {
    const overNumber = Number(over.over_number ?? 0);
    if (!Number.isFinite(overNumber) || overNumber <= 0) continue;
    const phase = pickPhase(out, overNumber);

    for (const ball of over.balls ?? []) {
      const scoring = String(ball.scoring ?? "");
      const runs = Number(ball.runs ?? 0);
      const wideOrNb = isWideOrNoBall(scoring);
      const wicket = isWicket(scoring);

      if (phase) {
        phase.runs += runs;
        if (wicket) phase.wickets += 1;
        if (!wideOrNb) phase.legalBalls += 1;
      }

      if (!wideOrNb) {
        legal += 1;
        if (runs === 0) dots += 1;
      }
    }
  }

  out.legalBalls = legal;
  out.dots = dots;
  out.dotBallPct = legal > 0 ? Math.round((dots / legal) * 1000) / 10 : 0;
}

export function computeScoringBreakdown(
  scorecard: WisdenScorecardResponse | null | undefined,
  commentary: WisdenCommentaryResponse | null | undefined,
): ScoringBreakdownResponse {
  const innings = scorecard?.innings ?? [];

  const commentaryByInning = new Map<number, CommentaryInnings>();
  for (const inn of (commentary?.innings ?? []) as CommentaryInnings[]) {
    commentaryByInning.set(inn.innings_number, inn);
  }

  const team1Short =
    scorecard?.team1?.abbreviation ?? scorecard?.team1?.name ?? undefined;
  const team2Short =
    scorecard?.team2?.abbreviation ?? scorecard?.team2?.name ?? undefined;

  const result: InningsScoringBreakdown[] = innings.map((inn) => {
    const out = buildEmptyInnings(
      inn.innings_number,
      inn.batting_team_id ?? null,
      inn.batting_team_name,
    );

    if (out.batting_team_id != null) {
      if (out.batting_team_id === scorecard?.team1?.id)
        out.batting_team_short = team1Short;
      else if (out.batting_team_id === scorecard?.team2?.id)
        out.batting_team_short = team2Short;
    }

    applyScorecardTotals(out, inn);

    const com = commentaryByInning.get(inn.innings_number);
    if (com) applyCommentaryPhases(out, com);

    return out;
  });

  return {
    match_status: scorecard?.match_status,
    team1: scorecard?.team1
      ? {
          id: scorecard.team1.id,
          name: scorecard.team1.name,
          abbreviation: scorecard.team1.abbreviation,
        }
      : undefined,
    team2: scorecard?.team2
      ? {
          id: scorecard.team2.id,
          name: scorecard.team2.name,
          abbreviation: scorecard.team2.abbreviation,
        }
      : undefined,
    innings: result,
  };
}
