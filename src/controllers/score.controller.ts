import type { RequestHandler } from "express";
import { scoresService } from "../services/score.service.js";

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
                score.points === undefined ||
                score.rank === undefined
            ) {
                return res.status(400).json({
                    error: "Each score must include seasonUserId, points, and rank",
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

        if (error instanceof Error && error.message.includes("same match")) {
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
    uploadMatchScores,
};
