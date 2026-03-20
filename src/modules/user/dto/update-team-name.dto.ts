import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdateTeamNameDto {
  @ApiProperty({
    example: "Mumbai Knights",
    description: "Team name for the season user (1-80 characters)",
    minLength: 1,
    maxLength: 80,
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  teamName!: string;
}
