import { ApiProperty } from "@nestjs/swagger";
import {
  MatchResult,
  MatchStatus,
} from "../../../../generated/prisma/client.js";

export class CricApiInningScoreDto {
  @ApiProperty({ example: 187 })
  r!: number;

  @ApiProperty({ example: 4 })
  w!: number;

  @ApiProperty({ example: 20 })
  o!: number;

  @ApiProperty({ example: "Mumbai Indians Inning 1" })
  inning!: string;
}

export class GetMatchScoreResponseDto {
  @ApiProperty({ format: "uuid" })
  matchId!: string;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.LIVE })
  status!: MatchStatus;

  @ApiProperty({ enum: MatchResult, example: MatchResult.PENDING })
  matchResult!: MatchResult;

  @ApiProperty({
    nullable: true,
    example: "Royal Challengers Bangalore need 47 runs in 30 balls",
  })
  cricApiStatus!: string | null;

  @ApiProperty({
    nullable: true,
    type: [CricApiInningScoreDto],
  })
  cricApiScore!: CricApiInningScoreDto[] | null;

  @ApiProperty({ format: "date-time", nullable: true })
  lastSyncedAt!: string | null;

  @ApiProperty({ example: false })
  isStale!: boolean;
}
