import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateDisplayNameDto {
  @ApiProperty({
    example: "Virat Kohli",
    description: "Display name for the user (1-80 characters)",
    minLength: 1,
    maxLength: 80,
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  @ApiProperty({
    required: false,
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
  photoUrl?: string | null;
}
