import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WeatherModule } from "../weather/weather.module.js";
import { MatchController } from "./match.controller.js";
import { MatchService } from "./match.service.js";

@Module({
  imports: [AuthModule, WeatherModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
