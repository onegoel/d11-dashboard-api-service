export interface SeriesInfoRes {
  apikey: string
  data: SeriesInfoResData
  status: string
  info: ApiMetaInfo
}

export interface SeriesInfoResData {
  info: Info
  matchList: MatchList[]
}

export interface Info {
  id: string
  name: string
  startdate: string
  enddate: string
  odi: number
  t20: number
  test: number
  squads: number
  matches: number
}

export interface MatchList {
  id: string
  name: string
  matchType: string
  status: string
  venue: string
  date: string
  dateTimeGMT: string
  teams: string[]
  teamInfo: TeamInfo[]
  fantasyEnabled: boolean
  bbbEnabled: boolean
  hasSquad: boolean
  matchStarted: boolean
  matchEnded: boolean
}

export interface TeamInfo {
  name: string
  shortname: string
  img: string
}

export interface ApiMetaInfo {
  hitsToday: number
  hitsUsed: number
  hitsLimit: number
  credits: number
  server: number
  queryTime: number
  s: number
  cache: number
}

export interface MatchInfoRes {
  apikey: string
  data: MatchInfoResData
  status: string
  info: ApiMetaInfo
}

export interface MatchInfoResData {
  id: string
  name: string
  matchType: string
  status: string
  venue: string
  date: string
  dateTimeGMT: string
  teams: string[]
  teamInfo: TeamInfo[]
  score: Score[]
  tossWinner: string
  tossChoice: string
  matchWinner: string
  series_id: string
  fantasyEnabled: boolean
  bbbEnabled: boolean
  hasSquad: boolean
  matchStarted: boolean
  matchEnded: boolean
}

export interface TeamInfo {
  name: string
  shortname: string
  img: string
}

export interface Score {
  r: number
  w: number
  o: number
  inning: string
}