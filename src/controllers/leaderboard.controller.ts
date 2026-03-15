import type { RequestHandler } from "express";
import { leaderboardService } from "../services/leaderboard.service.js";

const getSeasonLeaderboard: RequestHandler = async (req, res) => {
  try {
    const seasonId = Number(req.params.seasonId);

    if (!seasonId) {
      return res.status(400).json({
        error: "seasonId is required",
      });
    }

    const leaderboardData = await leaderboardService.getSeasonLeaderboard(seasonId);

    return res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching season leaderboard:", error);

    return res.status(500).json({
      error: "Failed to fetch season leaderboard",
    });
  }
};

const getMatchLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({
        error: "matchId is required",
      });
    }

    const leaderboard = await leaderboardService.getMatchLeaderboard(
      matchId as string,
    );

    return res.json({
      matchId,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching match leaderboard:", error);

    return res.status(500).json({
      error: "Failed to fetch match leaderboard",
    });
  }
};

export const leaderboardController = {
  getSeasonLeaderboard,
  getMatchLeaderboard,
};
