import { Module } from "@nestjs/common";
import { CricapiService } from "./cricapi.service.js";

@Module({
  providers: [CricapiService],
  exports: [CricapiService],
})
export class CricapiModule {}
