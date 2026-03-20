import { Module } from "@nestjs/common";
import { MatchController } from "./match.controller.js";
import { MatchService } from "./match.service.js";

@Module({
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
