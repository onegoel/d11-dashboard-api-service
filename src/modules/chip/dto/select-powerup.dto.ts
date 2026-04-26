import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { ChipCode } from "../../../../generated/prisma/client.js";

export enum SwapperActionType {
  CHANGE_CAPTAIN = "CHANGE_CAPTAIN",
  CHANGE_VICE_CAPTAIN = "CHANGE_VICE_CAPTAIN",
  SWAP_PLAYER = "SWAP_PLAYER",
}

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

  @ApiProperty({
    required: false,
    enum: SwapperActionType,
    description: "Required for SWAPPER: which swapper action to apply",
  })
  @IsOptional()
  @IsEnum(SwapperActionType)
  swapperActionType?: SwapperActionType;

  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 2,
    description:
      "Optional for SWAPPER: which team slot to apply on (defaults to 1)",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  swapperTeamNo?: number;

  @ApiProperty({
    required: false,
    format: "uuid",
    description:
      "For SWAPPER: incoming player UUID (new captain/vice OR replacement in XI)",
  })
  @IsOptional()
  @IsUUID()
  swapperIncomingFantasyPlayerId?: string;

  @ApiProperty({
    required: false,
    format: "uuid",
    description:
      "For SWAPPER + SWAP_PLAYER: outgoing non C/VC starter to remove from XI",
  })
  @IsOptional()
  @IsUUID()
  swapperOutgoingFantasyPlayerId?: string;
}
