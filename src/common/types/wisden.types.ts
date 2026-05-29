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

export type WisdenTableCompetitionNotes = {
  order?: string[];
  points?: string[];
};

export type WisdenTableTeamStat = {
  match_gid: string | null;
  match_id: number | null;
  team_name: string;
  title: string;
  value: string;
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
  competition_notes?: WisdenTableCompetitionNotes;
  team_stats?: WisdenTableTeamStat[];
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
  batting_team_name?: string;
  bowling_player_id?: number;
  bowling_player_name?: string;
  bowling_team_id?: number;
  bowling_team_name?: string;
  bowling_type_simple: string; // "pace" | "spin"
  bowling_technique: string;
  field_zone: number; // 1–8
  field_direction?: number; // compass deg, 0 = toward bowler, CW
  field_distance_percent?: number; // 0–100 along boundary radius
  field_magnitude?: number;
  innings_number: number;
  over_number: number;
  runs: number; // total runs on ball (inc. extras)
  runs_off_bat: number; // runs credited to batter
  runs_conceded?: number;
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

// Player entry from /comp/{id}/squads response
export type WisdenSquadsPlayer = {
  batting_hand: string | null;
  bowling_hand: string | null;
  is_keeper: number;
  player_id: number;
  player_image: string | null;
  photo_url?: string | null;
  player_known_as: string;
  player_name: string;
  player_role: string;
};

export type WisdenSquadsResponse = {
  teams: Array<{
    team_id: number;
    team_name: string;
    players: WisdenSquadsPlayer[];
  }>;
};

// /match/{gid}/winviz_history
export type WisdenWinVizWicket = {
  ball_number: number;
  legal_ball_number?: number;
  innings_number: number;
  over_number: number;
  batter_out: string;
  batter_runs: number;
  batter_balls: number;
  batter_fours: number;
  batter_sixes: number;
  dismissal: string;
  team_runs: number;
  team_wickets: number;
};

export type WisdenWinVizOver = {
  over: number;
  score: { runs: number; wickets: number };
  value1: number; // batting-first team win %
  value2: number; // bowling-first team win %
  draw?: number;
  wickets: WisdenWinVizWicket[];
};

export type WisdenWinVizTeam = {
  id: number;
  abbreviation: string;
  name_short?: string;
  name_full?: string;
  colour_primary?: string;
  colour_secondary?: string;
  colour_alternative?: string;
  graphic?: string;
  is_first_to_bat?: number;
  is_home_team?: number;
  value?: number;
};

export type WisdenWinVizResponse = {
  match_status?: string;
  scheduled_overs?: number;
  innings_data: Record<string, WisdenWinVizOver[]>;
  prematch?: {
    batting_first_team_win_prob: number;
    batting_second_team_win_prob: number;
    draw?: number | null;
    tie?: number | null;
  };
  team1: WisdenWinVizTeam;
  team2: WisdenWinVizTeam;
};

// /match/{gid}/manhattan
export type WisdenManhattanOver = {
  over_number: number;
  over_runs: number;
  over_wickets: number;
  current_score: number;
  bowler_name: string;
  batting_team_id: number;
  batting_team_name: string;
  batting_team_abbreviation: string;
  batting_team_colour_primary?: string;
  batting_team_colour_secondary?: string;
  bowling_team_colour_primary?: string;
  bowling_team_colour_secondary?: string;
};

export type WisdenManhattanResponse = {
  data: Record<string, WisdenManhattanOver[]>;
  match_info?: {
    scheduled_overs?: number;
    team1_id?: number;
    team1_name?: string;
    team1_abbreviation?: string;
    team1_colour_primary?: string;
    team2_id?: number;
    team2_name?: string;
    team2_abbreviation?: string;
    team2_colour_primary?: string;
    team_batting_first?: number;
    [key: string]: unknown;
  };
};
