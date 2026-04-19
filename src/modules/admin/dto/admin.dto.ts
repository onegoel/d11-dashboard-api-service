import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  ChipCode,
  MatchResult,
  MatchStatus,
  UserRole,
} from "../../../../generated/prisma/client.js";

export class AdminReasonDto {
  @ApiPropertyOptional({
    example: "Correcting a previously agreed manual adjustment",
    description: "Optional reason for this admin action",
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateAdminMatchDto extends AdminReasonDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  seasonId!: number;

  @ApiProperty({ example: 16 })
  @IsInt()
  @Min(1)
  matchNo!: number;

  @ApiProperty({ example: "2026-04-01T14:00:00.000Z" })
  @IsDateString()
  matchDate!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  homeTeamId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  awayTeamId!: string;

  @ApiPropertyOptional({ enum: MatchStatus, example: MatchStatus.SCHEDULED })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ enum: MatchResult, example: MatchResult.PENDING })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchResult)
  matchResult?: MatchResult;
}

export class BulkCreateAdminMatchesDto extends AdminReasonDto {
  @ApiProperty({ type: [CreateAdminMatchDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAdminMatchDto)
  matches!: CreateAdminMatchDto[];
}

export class UpdateAdminMatchDto extends AdminReasonDto {
  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsInt()
  @Min(1)
  matchNo?: number;

  @ApiPropertyOptional({ example: "2026-04-01T14:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  matchDate?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  homeTeamId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  awayTeamId?: string;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ enum: MatchResult })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchResult)
  matchResult?: MatchResult;
}

export class DeleteAdminMatchDto extends AdminReasonDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class ReopenMatchDto extends AdminReasonDto {
  @ApiPropertyOptional({
    enum: [MatchStatus.SCHEDULED, MatchStatus.LIVE],
    example: MatchStatus.LIVE,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({
    enum: [MatchResult.PENDING],
    example: MatchResult.PENDING,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(MatchResult)
  matchResult?: MatchResult;
}

export class AdminScoreEntryDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  seasonUserId!: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  rank!: number;
}

export class ReplaceMatchScoresDto extends AdminReasonDto {
  @ApiProperty({ type: [AdminScoreEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminScoreEntryDto)
  scores!: AdminScoreEntryDto[];
}

export class UpdateScoreRankDto extends AdminReasonDto {
  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  rank!: number;
}

export class ReverseChipPlayDto extends AdminReasonDto {}

export class ReassignChipPlayDto extends AdminReasonDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  seasonUserId?: string;

  @ApiPropertyOptional({ enum: ChipCode, example: ChipCode.DOUBLE_TEAM })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(ChipCode)
  chipCode?: ChipCode;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  startMatchId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  selectedTeamId?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "For ANCHOR_PLAYER: UUID of the anchor FantasyPlayer",
  })
  @IsOptional()
  @IsUUID()
  anchorFantasyPlayerId?: string;

  @ApiPropertyOptional({
    example: "Vaibhav Suryavanshi",
    description:
      "For ANCHOR_PLAYER: display name (stored alongside ID for readability)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  anchorPlayerName?: string;
}

export class AddSeasonUserDto extends AdminReasonDto {
  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiPropertyOptional({ example: "Baksy Blasters" })
  @IsOptional()
  @IsString()
  teamName?: string;
}

export class RemoveSeasonUserDto extends AdminReasonDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class CreateSeasonDto extends AdminReasonDto {
  @ApiProperty({ example: "IPL 2027" })
  @IsString()
  name!: string;

  @ApiProperty({ example: 2027 })
  @IsInt()
  year!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "2027-03-20T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2027-05-30T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  winnerUserId?: number;
}

export class UpdateSeasonDto extends AdminReasonDto {
  @ApiPropertyOptional({ example: "IPL 2027" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 2027 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "2027-03-20T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2027-05-30T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  winnerUserId?: number | null;
}

export class AuditLogQueryDto {
  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: "match" })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsString()
  entityId?: string;
}

export class UpdateUserRoleDto extends AdminReasonDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toUpperCase() : value,
  )
  @IsEnum(UserRole)
  role!: UserRole;
}
