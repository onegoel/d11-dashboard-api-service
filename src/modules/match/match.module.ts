import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { MatchController } from "./match.controller.js";
import { MatchService } from "./match.service.js";

@Module({
  imports: [AuthModule, WisdenModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
