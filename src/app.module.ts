import { Module } from "@nestjs/common";
import { DatabaseModule } from "./common/database/database.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ChipModule } from "./modules/chip/chip.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module.js";
import { MatchModule } from "./modules/match/match.module.js";
import { ScoreModule } from "./modules/score/score.module.js";
import { UserModule } from "./modules/user/user.module.js";

@Module({
  imports: [
    DatabaseModule,
    AdminModule,
    AuthModule,
    HealthModule,
    LeaderboardModule,
    UserModule,
    MatchModule,
    ScoreModule,
    ChipModule,
  ],
})
export class AppModule {}
