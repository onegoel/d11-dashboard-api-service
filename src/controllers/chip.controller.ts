import type { RequestHandler } from "express";
import { ChipCode } from "../../generated/prisma/client.js";
import { ChipServiceError, chipService } from "../services/chip.service.js";

const parseChipCode = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toUpperCase();

  if (!(normalized in ChipCode)) {
    return null;
  }

  return ChipCode[normalized as keyof typeof ChipCode];
};

const getSeasonPowerups: RequestHandler = async (req, res) => {
  try {
    const seasonId = Number(req.params.seasonId);

    if (!seasonId) {
      return res.status(400).json({
        error: "seasonId is required",
      });
    }

    const overview = await chipService.getSeasonPowerupsOverview(seasonId);

    return res.json(overview);
  } catch (error) {
    if (error instanceof ChipServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch season powerups",
    });
  }
};

const selectPowerup: RequestHandler = async (req, res) => {
  try {
    const seasonId = Number(req.params.seasonId);
    const seasonUserId =
      typeof req.body?.seasonUserId === "string" ? req.body.seasonUserId : null;
    const startMatchId =
      typeof req.body?.startMatchId === "string" ? req.body.startMatchId : null;
    const chipCode = parseChipCode(req.body?.chipCode);

    if (!seasonId) {
      return res.status(400).json({
        error: "seasonId is required",
      });
    }

    if (!seasonUserId || !startMatchId || !chipCode) {
      return res.status(400).json({
        error: "seasonUserId, chipCode, and startMatchId are required",
      });
    }

    const selection = await chipService.selectPowerupForSeasonMatch({
      seasonId,
      seasonUserId,
      chipCode,
      startMatchId,
    });

    return res.json(selection);
  } catch (error) {
    if (error instanceof ChipServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Failed to select powerup",
    });
  }
};

const deselectPowerup: RequestHandler = async (req, res) => {
  try {
    const chipPlayIdParam = req.params.chipPlayId;
    const chipPlayId =
      Array.isArray(chipPlayIdParam) || !chipPlayIdParam ? null : chipPlayIdParam;

    if (!chipPlayId) {
      return res.status(400).json({
        error: "chipPlayId is required",
      });
    }

    const updatedSelection = await chipService.deselectPowerup(chipPlayId);

    return res.json(updatedSelection);
  } catch (error) {
    if (error instanceof ChipServiceError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Failed to deselect powerup",
    });
  }
};

export const chipController = {
  getSeasonPowerups,
  selectPowerup,
  deselectPowerup,
};