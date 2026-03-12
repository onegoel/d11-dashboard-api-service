import type { RequestHandler } from "express";
import { matchService } from "../services/match.service.js";

const getSeasonMatches: RequestHandler = async (req, res) => {
  try {
    const { seasonId } = req.params;

    if (!seasonId) {
      res.status(400);
    }

    const matches = await matchService.getSeasonMatches(Number(seasonId));
    res.json(matches);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const matchController = {
  getSeasonMatches,
};
