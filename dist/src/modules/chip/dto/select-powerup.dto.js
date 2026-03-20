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
import { Transform } from "class-transformer";
import { IsEnum, IsUUID } from "class-validator";
import { ChipCode } from "../../../../generated/prisma/client.js";
export class SelectPowerupDto {
    seasonUserId;
    startMatchId;
    chipCode;
}
__decorate([
    ApiProperty({
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "The season user ID who is selecting the powerup",
    }),
    IsUUID(),
    __metadata("design:type", String)
], SelectPowerupDto.prototype, "seasonUserId", void 0);
__decorate([
    ApiProperty({
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "The match ID where the powerup is being activated",
    }),
    IsUUID(),
    __metadata("design:type", String)
], SelectPowerupDto.prototype, "startMatchId", void 0);
__decorate([
    ApiProperty({
        enum: ChipCode,
        example: "BOOST",
        description: "The powerup chip code (BOOST, SUPER_SUB, SUPER_SAVER, EXTRA_POWER)",
    }),
    Transform(({ value }) => typeof value === "string" ? value.toUpperCase() : value),
    IsEnum(ChipCode),
    __metadata("design:type", String)
], SelectPowerupDto.prototype, "chipCode", void 0);
//# sourceMappingURL=select-powerup.dto.js.map