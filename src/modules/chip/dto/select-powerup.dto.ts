import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from "class-validator";
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
    description:
      "The powerup chip code (BOOST, SUPER_SUB, SUPER_SAVER, EXTRA_POWER)",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(ChipCode)
  chipCode!: ChipCode;

  @ApiProperty({
    format: "uuid",
    required: false,
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Required for TEAM_FORM: selected team ID",
  })
  @IsOptional()
  @IsUUID()
  selectedTeamId?: string;

  @ApiProperty({
    required: false,
    format: "uuid",
    description: "Required for ANCHOR_PLAYER: UUID of the anchor FantasyPlayer",
  })
  @ValidateIf(
    (dto: SelectPowerupDto) => dto.chipCode === ChipCode.ANCHOR_PLAYER,
  )
  @IsUUID()
  @IsNotEmpty()
  anchorFantasyPlayerId?: string;

  @ApiProperty({
    required: false,
    example: "Virat Kohli",
    description:
      "Display name of the anchor player (stored alongside ID for readability)",
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(80)
  anchorPlayerName?: string;
}
