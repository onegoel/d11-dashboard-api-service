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
import { IsString, MaxLength, MinLength } from "class-validator";
export class UpdateTeamNameDto {
    teamName;
}
__decorate([
    ApiProperty({
        example: "Mumbai Knights",
        description: "Team name for the season user (1-80 characters)",
        minLength: 1,
        maxLength: 80,
    }),
    Transform(({ value }) => typeof value === "string" ? value.trim() : value),
    IsString(),
    MinLength(1),
    MaxLength(80),
    __metadata("design:type", String)
], UpdateTeamNameDto.prototype, "teamName", void 0);
//# sourceMappingURL=update-team-name.dto.js.map