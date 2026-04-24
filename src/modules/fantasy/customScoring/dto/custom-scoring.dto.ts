import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCustomScoringSystemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // Shape validated at service layer against FantasyPointSystem structure
  @IsObject()
  config!: Record<string, unknown>;
}

export class UpdateCustomScoringSystemDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
