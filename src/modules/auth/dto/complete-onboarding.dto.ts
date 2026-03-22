import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength, IsOptional, Matches } from "class-validator";

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
    description: "Optional profile photo URL override (https URL or data URI)",
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(https?:\/\/.+|data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)$/,
    { message: "photoUrl must be a valid https URL or image data URI" },
  )
  @MaxLength(3_000_000)
  photoUrl?: string;
}
