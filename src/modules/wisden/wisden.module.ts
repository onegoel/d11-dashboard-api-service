import { Module } from "@nestjs/common";
import { WisdenService } from "./wisden.service.js";

@Module({
  providers: [WisdenService],
  exports: [WisdenService],
})
export class WisdenModule {}
