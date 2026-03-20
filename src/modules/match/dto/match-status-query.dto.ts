import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional } from "class-validator";
import { MatchStatus } from "../../../../generated/prisma/client.js";

export class MatchStatusQueryDto {
  @ApiProperty({
    enum: MatchStatus,
    example: "NOT_STARTED",
    description: "Optional match status filter (NOT_STARTED, IN_PROGRESS, COMPLETED)",
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
