import type { RequestHandler } from "express";
import { scoresService } from "../services/score.service.js";

const uploadMatchScores: RequestHandler = async (req, res) => {
  try {
    const { matchId, seasonUserId, points, rank } = req.body;

    if (!matchId || !seasonUserId || points === undefined) {
      return res.status(400).json({
        error: "matchId, seasonUserId and points are required",
      });
    }

    const score = await scoresService.submitMatchScore({
      matchId,
      seasonUserId,
      points,
      rank,
    });

    res.json(score);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to submit score",
    });
  }
};

export const scoreController = {
  uploadMatchScores,
};
