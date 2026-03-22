import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service.js";
import { FirebaseAuthGuard } from "./firebase-auth.guard.js";
import { CurrentAuthUser } from "./current-auth-user.decorator.js";
import type { AuthenticatedUser } from "./auth.types.js";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto.js";

@Controller("auth")
@ApiTags("auth")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current authenticated user profile" })
  @ApiResponse({ status: 200, description: "Current user profile" })
  getMe(@CurrentAuthUser() authUser: AuthenticatedUser) {
    return this.authService.getMe(authUser);
  }

  @Post("onboarding")
  @ApiOperation({ summary: "Complete first-time onboarding" })
  @ApiResponse({ status: 200, description: "Onboarding completed" })
  completeOnboarding(
    @CurrentAuthUser() authUser: AuthenticatedUser,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.authService.completeOnboarding(authUser, body);
  }
}
