import type { RequestHandler } from "express";
import { ChipServiceError } from "../services/chip.service.js";
import { scoresService } from "../services/score.service.js";

const getMatchScores: RequestHandler = async (req, res) => {
    try {
        const matchIdParam = req.params.matchId;
        const matchId =
            Array.isArray(matchIdParam) || !matchIdParam ? null : matchIdParam;

        if (!matchId) {
            return res.status(400).json({
                error: "matchId is required in route params",
            });
        }

        const response = await scoresService.getMatchScores(matchId);

        return res.json({
            matchId,
            scores: response.scores,
            chipAssignments: response.chipAssignments,
        });
    } catch (error) {
        console.error(error);

        if (error instanceof ChipServiceError) {
            return res.status(error.statusCode).json({
                error: error.message,
            });
        }

        return res.status(500).json({
            error: "Failed to fetch match scores",
        });
    }
};

const uploadMatchScores: RequestHandler = async (req, res) => {
    try {
        const matchIdParam = req.params.matchId;
        const matchId =
            Array.isArray(matchIdParam) || !matchIdParam ? null : matchIdParam;
        const scores = req.body;

        if (!matchId) {
            return res.status(400).json({
                error: "matchId is required in route params",
            });
        }

        if (!Array.isArray(scores)) {
            return res.status(400).json({
                error: "Request body must be an array of scores",
            });
        }

        for (const score of scores) {
            if (
                !score.seasonUserId ||
                score.rank === undefined
            ) {
                return res.status(400).json({
                    error: "Each score must include seasonUserId and rank",
                });
            }

            if (
                typeof score.rank !== "number" ||
                !Number.isInteger(score.rank) ||
                score.rank <= 0
            ) {
                return res.status(400).json({
                    error: "rank must be a positive integer",
                });
            }
        }

        const result = await scoresService.submitMatchScoresBulk(matchId, scores);

        res.json({
            message: "Match scores uploaded successfully",
            scores: result,
        });
    } catch (error) {
        console.error(error);

        if (error instanceof ChipServiceError) {
            return res.status(error.statusCode).json({
                error: error.message,
            });
        }

        if (error instanceof Error && error.message.includes("same match")) {
            return res.status(400).json({
                error: error.message,
            });
        }

        if (error instanceof Error) {
            return res.status(400).json({
                error: error.message,
            });
        }

        return res.status(500).json({
            error: "Failed to submit match scores",
        });
    }
};

export const scoreController = {
    getMatchScores,
    uploadMatchScores,
};
