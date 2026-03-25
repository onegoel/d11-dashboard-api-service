import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Matches, Max, Min } from "class-validator";

export class CreateProfilePhotoUploadDto {
  @ApiProperty({
    example: "image/jpeg",
    description: "Image MIME type",
  })
  @IsString()
  @Matches(/^image\/(jpeg|jpg|png|webp)$/i, {
    message: "Only jpeg, png, and webp images are supported",
  })
  contentType!: string;

  @ApiProperty({
    example: 182341,
    description: "Compressed image file size in bytes",
  })
  @IsInt()
  @Min(1)
  @Max(2 * 1024 * 1024)
  sizeBytes!: number;
}