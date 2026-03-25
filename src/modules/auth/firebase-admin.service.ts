import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { App } from "firebase-admin/app";
import type { Storage } from "firebase-admin/storage";

@Injectable()
export class FirebaseAdminService {
  private readonly app: App | null;
  private readonly storageBucketName: string | null;
  readonly isConfigured: boolean;

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
    const configuredBucket = process.env.PROFILE_PHOTO_BUCKET?.trim() || process.env.FIREBASE_STORAGE_BUCKET?.trim();

    this.isConfigured = Boolean(projectId && clientEmail && privateKey);
    this.storageBucketName = configuredBucket || (projectId ? `${projectId}.appspot.com` : null);

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
        ...(this.storageBucketName ? { storageBucket: this.storageBucketName } : {}),
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

  getProfilePhotoBucket(): ReturnType<Storage["bucket"]> {
    if (!this.app || !this.storageBucketName) {
      throw new ServiceUnavailableException(
        "Profile photo storage is not configured. Set PROFILE_PHOTO_BUCKET (or FIREBASE_STORAGE_BUCKET).",
      );
    }

    return getStorage(this.app).bucket(this.storageBucketName);
  }

  async setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
    if (!this.app) {
      throw new ServiceUnavailableException(
        "Firebase Admin is not configured on the API. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
      );
    }

    await getAuth(this.app).setCustomUserClaims(uid, claims);
  }
}
