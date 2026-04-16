import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "./common/database/database.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ChipModule } from "./modules/chip/chip.module.js";
import { FantasyModule } from "./modules/fantasy/fantasy.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module.js";
import { MatchIngestionModule } from "./modules/matchIngestion/match-ingestion.module.js";
import { MatchModule } from "./modules/match/match.module.js";
import { ScoreModule } from "./modules/score/score.module.js";
import { UserModule } from "./modules/user/user.module.js";
import { LiveScoreModule } from "./modules/liveScore/live-score.module.js";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AdminModule,
    AuthModule,
    HealthModule,
    LeaderboardModule,
    UserModule,
    MatchModule,
    ScoreModule,
    ChipModule,
    FantasyModule,
    LiveScoreModule,
    MatchIngestionModule,
  ],
})
export class AppModule {}
