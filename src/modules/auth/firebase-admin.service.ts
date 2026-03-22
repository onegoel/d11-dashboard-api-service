import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { App } from "firebase-admin/app";

@Injectable()
export class FirebaseAdminService {
  private readonly app: App | null;
  readonly isConfigured: boolean;

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

    this.isConfigured = Boolean(projectId && clientEmail && privateKey);

    if (!this.isConfigured || !projectId || !clientEmail || !privateKey) {
      this.app = null;
      return;
    }

    const appName = "d11-dashboard-auth";
    const existing = getApps().find((app) => app.name === appName);

    this.app = existing ?? initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      },
      appName,
    );
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new ServiceUnavailableException(
        "Firebase Admin is not configured on the API. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
      );
    }

    return getAuth(this.app).verifyIdToken(token);
  }
}
