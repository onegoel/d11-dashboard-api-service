import type { RequestHandler } from "express";
import { usersService } from "../services/user.service.js";

const isRecordNotFoundError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return (error as { code?: string }).code === "P2025";
};

const getTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const getSeasonPlayers: RequestHandler = async (req, res) => {
  try {
    const seasonId = Number(req.params.seasonId);

    if (!seasonId) {
      return res.status(400).json({
        error: "seasonId is required",
      });
    }

    const seasonUsers = await usersService.getSeasonUsers(seasonId);
    return res.json(seasonUsers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateDisplayName: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const displayName = getTrimmedString(req.body?.displayName);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!displayName) {
      return res.status(400).json({ error: "displayName is required" });
    }

    const updatedUser = await usersService.updateUserDisplayName(userId, displayName);

    return res.json({
      id: updatedUser.id,
      displayName: updatedUser.display_name,
    });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateTeamName: RequestHandler = async (req, res) => {
  try {
    const seasonUserId = getTrimmedString(req.params.seasonUserId);
    const teamName = getTrimmedString(req.body?.teamName);

    if (!seasonUserId) {
      return res.status(400).json({ error: "seasonUserId is required" });
    }

    if (!teamName) {
      return res.status(400).json({ error: "teamName is required" });
    }

    const updatedSeasonUser = await usersService.updateSeasonUserTeamName(
      seasonUserId,
      teamName,
    );

    return res.json({
      id: updatedSeasonUser.id,
      teamName: updatedSeasonUser.teamName,
      userId: updatedSeasonUser.userId,
      displayName: updatedSeasonUser.user.display_name,
    });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return res.status(404).json({ error: "Season user not found" });
    }

    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const userController = {
  getSeasonPlayers,
  updateDisplayName,
  updateTeamName,
};
