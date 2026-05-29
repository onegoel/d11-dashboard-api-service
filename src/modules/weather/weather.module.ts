import { Module } from "@nestjs/common";
import { WeatherPollerService } from "./weather-poller.service.js";

@Module({
  providers: [WeatherPollerService],
  exports: [WeatherPollerService],
})
export class WeatherModule {}
