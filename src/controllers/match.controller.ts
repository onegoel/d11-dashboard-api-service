import type { RequestHandler } from "express";
import { MatchStatus } from "../../generated/prisma/client.js";
import { matchService } from "../services/match.service.js";

const parseMatchStatus = (value?: string): MatchStatus | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();

  if (!(normalized in MatchStatus)) {
    return null;
  }

  return MatchStatus[normalized as keyof typeof MatchStatus];
};

const getSeasonMatches: RequestHandler = async (req, res) => {
  try {
    const seasonId = Number(req.params.seasonId);
    const statusQuery =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const status = parseMatchStatus(statusQuery);

    if (!seasonId) {
      return res.status(400).json({
        error: "seasonId is required",
      });
    }

    if (statusQuery && !status) {
      return res.status(400).json({
        error: "Invalid match status. Use SCHEDULED, LIVE, or COMPLETED",
      });
    }

    const matches = status
      ? await matchService.getSeasonMatches(seasonId, { status })
      : await matchService.getSeasonMatches(seasonId);

    return res.json(matches);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateMatchStatus: RequestHandler = async (req, res) => {
  try {
    const matchIdParam = req.params.matchId;
    const statusValue = req.body?.status;
    const status =
      typeof statusValue === "string"
        ? parseMatchStatus(statusValue)
        : null;
    const matchId =
      Array.isArray(matchIdParam) || !matchIdParam ? null : matchIdParam;

    if (!matchId) {
      return res.status(400).json({
        error: "matchId is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        error: "status is required and must be SCHEDULED, LIVE, or COMPLETED",
      });
    }

    const updatedMatch = await matchService.updateMatchStatus(matchId, status);

    return res.json(updatedMatch);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update match status",
    });
  }
};

export const matchController = {
  getSeasonMatches,
  updateMatchStatus,
};
