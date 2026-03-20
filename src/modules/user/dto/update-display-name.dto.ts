import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdateDisplayNameDto {
  @ApiProperty({
    example: "Virat Kohli",
    description: "Display name for the user (1-80 characters)",
    minLength: 1,
    maxLength: 80,
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;
}
