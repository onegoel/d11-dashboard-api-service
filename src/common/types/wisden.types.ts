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
};

export type WisdenScorecardBowlingEntry = {
  player_id: number;
  player_known_as: string;
  player_name: string;
  overs?: string | number;
  wickets?: number;
  maidens?: number;
  runs_conceded?: number;
  wides?: number;
  no_balls?: number;
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
  total_ball_count?: number;
  batting?: WisdenScorecardBattingEntry[];
  bowling?: WisdenScorecardBowlingEntry[];
};

export type WisdenScorecardResponse = {
  match_status?: string;
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
