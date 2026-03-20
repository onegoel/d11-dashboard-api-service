var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { DatabaseModule } from "./common/database/database.module.js";
import { ChipModule } from "./modules/chip/chip.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module.js";
import { MatchModule } from "./modules/match/match.module.js";
import { ScoreModule } from "./modules/score/score.module.js";
import { UserModule } from "./modules/user/user.module.js";
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            DatabaseModule,
            HealthModule,
            LeaderboardModule,
            UserModule,
            MatchModule,
            ScoreModule,
            ChipModule,
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map