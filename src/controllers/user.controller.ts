import type { RequestHandler } from "express";
import { usersService } from "../services/user.service.js";

const getSeasonPlayers: RequestHandler = async (req, res) => {
  try {
    const { seasonId } = req.params;

    if (!seasonId) {
      res.status(400);
    }

    const matches = await usersService.getSeasonUsers(Number(seasonId));
    res.json(matches);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const userController = {
  getSeasonPlayers,
};
