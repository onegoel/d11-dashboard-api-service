import { Module } from "@nestjs/common";
import { AppUserGuard } from "./app-user.guard.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { FirebaseAdminService } from "./firebase-admin.service.js";
import { FirebaseAuthGuard } from "./firebase-auth.guard.js";
import { RolesGuard } from "./roles.guard.js";
import { DatabaseModule } from "../../common/database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseAdminService,
    FirebaseAuthGuard,
    AppUserGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    FirebaseAdminService,
    FirebaseAuthGuard,
    AppUserGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
