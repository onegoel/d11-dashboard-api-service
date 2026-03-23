import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, ValidateNested } from "class-validator";
import { MatchResult } from "../../../../generated/prisma/client.js";
import { UploadScoreDto } from "./upload-score.dto.js";

export class SubmitMatchScoresDto {
  @ApiProperty({ type: [UploadScoreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadScoreDto)
  scores!: UploadScoreDto[];

  @ApiProperty({
    enum: MatchResult,
    example: MatchResult.HOME_WIN,
    description: "Result of the match used for Team Form powerup scoring",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchResult)
  matchResult!: MatchResult;
}
