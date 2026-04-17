import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import { MatchStatus } from "../../../../generated/prisma/client.js";

export class UpdateMatchStatusDto {
  @ApiProperty({
    enum: MatchStatus,
    example: "COMPLETED",
    description:
      "Match status to update to (NOT_STARTED, IN_PROGRESS, COMPLETED)",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchStatus)
  status!: MatchStatus;
}
