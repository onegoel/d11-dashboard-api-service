import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ChipCode } from "../../../../generated/prisma/client.js";

export class EntryPlayerDto {
  @ApiProperty({ format: "uuid", description: "FantasyPlayer UUID" })
  @IsUUID()
  fantasyPlayerId!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isCaptain!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  isViceCaptain!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  isBench!: boolean;

  @ApiPropertyOptional({
    description: "1–4, required when isBench=true",
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  benchPriority?: number;
}

export class SubmitEntryDto {
  @ApiProperty({ minimum: 1, maximum: 2, description: "Team slot (1 or 2)" })
  @IsInt()
  @Min(1)
  @Max(2)
  teamNo!: number;

  @ApiPropertyOptional({
    enum: ChipCode,
    description: "Chip to apply to this team",
  })
  @IsOptional()
  @IsEnum(ChipCode)
  chipCode?: ChipCode;

  @ApiProperty({
    type: [EntryPlayerDto],
    description: "Exactly 11 starters + optional 0-4 bench players",
  })
  @IsArray()
  @ArrayMinSize(11)
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => EntryPlayerDto)
  players!: EntryPlayerDto[];
}

export class ExtendContestDeadlineDto {
  @ApiProperty({
    description: "Minutes to extend current contest deadline by",
    minimum: 1,
    maximum: 360,
    example: 15,
  })
  @IsInt()
  @Min(1)
  @Max(360)
  extendByMinutes!: number;
}
