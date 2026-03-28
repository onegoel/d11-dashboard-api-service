const API_KEY = process.env.CRICAPI_API_KEY;

export const CRICAPI_BASE_URL = "https://api.cricapi.com/v1";

export const CRICAPI_ENDPOINTS = {
  SERIES_INFO: (seriesId: string) =>
    `series_info?apiKey=${API_KEY}&id=${seriesId}`,
  MATCH_INFO: (matchId: string) => `match_info?apiKey=${API_KEY}&id=${matchId}`,
};
