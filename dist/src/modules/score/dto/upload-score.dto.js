var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Min } from "class-validator";
export class UploadScoreDto {
    seasonUserId;
    rank;
}
__decorate([
    ApiProperty({
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "The season user ID for this score entry",
    }),
    IsUUID(),
    __metadata("design:type", String)
], UploadScoreDto.prototype, "seasonUserId", void 0);
__decorate([
    ApiProperty({
        example: 3,
        description: "The rank/position achieved (must be >= 1)",
        minimum: 1,
    }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], UploadScoreDto.prototype, "rank", void 0);
//# sourceMappingURL=upload-score.dto.js.map