import { Module } from "@nestjs/common";
import { ChipController } from "./chip.controller.js";
import { ChipService } from "./chip.service.js";

@Module({
  controllers: [ChipController],
  providers: [ChipService],
  exports: [ChipService],
})
export class ChipModule {}
