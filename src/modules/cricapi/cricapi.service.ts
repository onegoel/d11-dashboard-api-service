import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { CRICAPI_BASE_URL, CRICAPI_ENDPOINTS } from "./cricapi.endpoints.js";
import {
  CRICAPI_MATCH_INFO_MOCK_FILE,
  CRICAPI_SCORE_SOURCE,
  CRICAPI_USE_MOCK_SCORE,
} from "./cricapi.source-config.js";
import type { MatchInfoRes } from "./cricapi.types.js";

@Injectable()
export class CricapiService {
  async getMatchInfo(matchId: string): Promise<MatchInfoRes> {
    if (CRICAPI_USE_MOCK_SCORE) {
      return this.getMockMatchInfo(matchId);
    }

    return this.getLiveMatchInfo(matchId);
  }

  private async getMockMatchInfo(matchId: string): Promise<MatchInfoRes> {
    const raw = await this.readMockMatchInfoFile();
    const parsed = JSON.parse(raw) as MatchInfoRes;

    return {
      ...parsed,
      data: {
        ...parsed.data,
        id: matchId,
      },
    };
  }

  private async getLiveMatchInfo(matchId: string): Promise<MatchInfoRes> {
    const apiKey = (process.env.CRICAPI_API_KEY ?? "").trim();
    if (!apiKey) {
      throw new InternalServerErrorException(
        "CRICAPI_API_KEY is required when CRICAPI_SCORE_SOURCE resolves to live",
      );
    }

    const url = `${CRICAPI_BASE_URL}/${CRICAPI_ENDPOINTS.MATCH_INFO(matchId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException(
        `CricAPI match_info failed with status ${response.status}`,
      );
    }

    const json = (await response.json()) as MatchInfoRes;
    if (json.status !== "success") {
      throw new BadGatewayException(
        `CricAPI returned non-success status: ${json.status}`,
      );
    }

    return json;
  }

  private async readMockMatchInfoFile(): Promise<string> {
    const candidatePaths = [
      fileURLToPath(CRICAPI_MATCH_INFO_MOCK_FILE),
      resolve(
        process.cwd(),
        "src/modules/cricapi/mocks/cricapi-match-info-mock.json",
      ),
    ];

    for (const path of candidatePaths) {
      try {
        return await readFile(path, "utf-8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    throw new InternalServerErrorException(
      "Unable to locate CricAPI mock match info JSON file",
    );
  }

  getScoreSource() {
    return CRICAPI_SCORE_SOURCE;
  }
}
