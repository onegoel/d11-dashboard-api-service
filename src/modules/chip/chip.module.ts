import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ChipController } from "./chip.controller.js";
import { ChipService } from "./chip.service.js";

@Module({
  imports: [AuthModule],
  controllers: [ChipController],
  providers: [ChipService],
  exports: [ChipService],
})
export class ChipModule {}
