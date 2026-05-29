import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { RecordsController } from "./records.controller.js";
import { RecordsService } from "./records.service.js";

@Module({
  imports: [AuthModule, WisdenModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
