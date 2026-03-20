import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsUUID } from "class-validator";
import { ChipCode } from "../../../../generated/prisma/client.js";

export class SelectPowerupDto {
  @ApiProperty({
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "The season user ID who is selecting the powerup",
  })
  @IsUUID()
  seasonUserId!: string;

  @ApiProperty({
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "The match ID where the powerup is being activated",
  })
  @IsUUID()
  startMatchId!: string;

  @ApiProperty({
    enum: ChipCode,
    example: "BOOST",
    description: "The powerup chip code (BOOST, SUPER_SUB, SUPER_SAVER, EXTRA_POWER)",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(ChipCode)
  chipCode!: ChipCode;
}
