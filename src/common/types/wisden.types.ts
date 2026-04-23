export type WisdenTableTeam = {
  position: number;
  points: number;
  net_run_rate: number;
  team_abbreviation: string;
  team_id: number;
  team_logo?: string | null;
  team_name: string;
  team_short_name?: string;
  matches: number;
  won: number;
  lost: number;
  no_result: number;
};

export type WisdenTableResponse = {
  comp_gid: string;
  comp_id: number;
  comp_name: string;
  season: string;
  groups: Array<{
    group_name: string;
    team: WisdenTableTeam[];
  }>;
};

export type WisdenScorecardTeamPlayer = {
  player_id: number;
  player_known_as: string;
  player_name: string;
  player_role?: string;
  role?: string;
  team_id?: number;
  is_keeper?: number;
  is_captain?: number;
  type?: string | null;
};

export type WisdenScorecardTeam = {
  id: number;
  name: string;
  abbreviation: string;
  logo?: string | null;
  players?: WisdenScorecardTeamPlayer[];
};

export type WisdenScorecardBattingEntry = {
  player_id: number;
  player_known_as: string;
  player_name: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  dismissal_str?: string;
  is_out?: number;
  // Advanced scorecard fields (available when ?advanced=true)
  batting_position?: number;
  dot_ball_percentage?: string | number | null;
  boundary_percentage?: string | number | null;
  impact?: number | null;
  type?: string; // "substitute" | "replaced" for impact subs
  batted: "yes" | "DNB";
};

export type WisdenScorecardBowlingEntry = {
  // Basic scorecard uses player_id/player_known_as/player_name
  // Advanced scorecard uses bowler_id/bowler_known_as/bowler_name
  player_id?: number;
  player_known_as?: string;
  player_name?: string;
  bowler_id?: number;
  bowler_known_as?: string;
  bowler_name?: string;
  overs?: string | number;
  wickets?: number;
  maidens?: number;
  runs?: number; // advanced scorecard field (runs conceded)
  runs_conceded?: number;
  wides?: number;
  noballs?: number;
  no_balls?: number;
  economy_rate?: string | number;
  type?: string; // "substitute" | "replaced"
  // Advanced scorecard fields (available when ?advanced=true)
  bowling_position?: number;
  impact?: number | null;
  dot_ball_percentage?: string | number | null;
};

export type WisdenScorecardInnings = {
  innings_number: number;
  batting_team_id: number;
  batting_team_name?: string;
  bowling_team_id?: number;
  bowling_team_name?: string;
  overs?: string | number;
  runs?: number;
  wickets?: number;
  score?: {
    runs?: number;
    wickets?: number;
  };
  total_ball_count?: number;
  batting?: WisdenScorecardBattingEntry[];
  bowling?: WisdenScorecardBowlingEntry[];
};

export type WisdenScorecardResponse = {
  match_status?: string;
  match_result?: string;
  live_status_id?: number;
  start_datetime_utc?: string;
  scheduled_overs?: number;
  team_batting_first?: number;
  toss_comment?: string;
  team1?: WisdenScorecardTeam;
  team2?: WisdenScorecardTeam;
  innings?: WisdenScorecardInnings[];
};

export type WisdenCommentaryBall = {
  display_overs: string;
  overs_unique: string;
  runs: number;
  scoring: string;
  commentary?: {
    ball_summary_text?: string;
    message?: string;
  };
};

export type WisdenCommentaryOver = {
  over_number: number;
  bowling_player_name: string;
  team_score: string;
  balls: WisdenCommentaryBall[];
};

export type WisdenCommentaryInnings = {
  innings_number: number;
  batting_team_id: number;
  batting_team_name: string;
  bbb: WisdenCommentaryOver[];
};

export type WisdenCommentaryResponse = {
  match_status?: string;
  innings?: WisdenCommentaryInnings[];
  team1?: { id: number; name: string; abbreviation: string };
  team2?: { id: number; name: string; abbreviation: string };
};

// Per-ball entry from /wagon endpoint (spider_data and catch_map arrays)
export type WisdenWagonWheelBall = {
  ball_id: number;
  ball_number: number;
  batting_player_id: number;
  batting_player_name: string;
  batting_player_hand: string;
  batting_team_id: number;
  bowling_type_simple: string; // "pace" | "spin"
  bowling_technique: string;
  field_zone: number; // 1–8
  innings_number: number;
  over_number: number;
  runs: number; // total runs on ball (inc. extras)
  runs_off_bat: number; // runs credited to batter
};

export type WisdenWagonWheelResponse = {
  spider_data: WisdenWagonWheelBall[];
  catch_map: WisdenWagonWheelBall[];
};

// Player entry from /pitchmap teams array
export type WisdenPitchmapPlayer = {
  id: number;
  name: string;
  batting_hand: string;
  bowling_hand: string;
  bowling_technique: string;
  bowling_type_simple: string;
};

export type WisdenPitchmapResponse = {
  teams: Array<{ id: number; players: WisdenPitchmapPlayer[] }>;
  tracking_data: unknown[];
};
