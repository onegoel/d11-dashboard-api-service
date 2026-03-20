import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Min } from "class-validator";

export class UploadScoreDto {
  @ApiProperty({
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "The season user ID for this score entry",
  })
  @IsUUID()
  seasonUserId!: string;

  @ApiProperty({
    example: 3,
    description: "The rank/position achieved (must be >= 1)",
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  rank!: number;
}
