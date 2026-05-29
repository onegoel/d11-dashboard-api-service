import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  Matches,
} from "class-validator";

export class CompleteOnboardingDto {
  @ApiProperty({ example: "Aronya" })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  displayName!: string;

  @ApiProperty({ example: "Baksy Blasters" })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  teamName!: string;

  @ApiPropertyOptional({
    example: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    description:
      "Optional profile photo URL override (must be a hosted https URL)",
  })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/.+/, {
    message: "photoUrl must be a valid https URL",
  })
  @MaxLength(2048)
  photoUrl?: string;
}
