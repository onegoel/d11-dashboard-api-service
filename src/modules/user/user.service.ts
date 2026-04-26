import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { UserRole } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
import { FirebaseAdminService } from "../auth/firebase-admin.service.js";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async getSeasonUsers(seasonId: number) {
    return this.prisma.client.seasonUser.findMany({
      where: {
        seasonId,
      },
      include: {
        user: true,
      },
    });
  }

  async updateUserDisplayName(
    userId: number,
    displayName: string,
    photoUrl: string | null | undefined,
    actor: { id: number; role: UserRole },
  ) {
    if (actor.role !== UserRole.ADMIN && actor.id !== userId) {
      throw new ForbiddenException("You can only update your own display name");
    }

    if (typeof photoUrl === "string" && photoUrl.trim().length > 0) {
      this.assertValidPhotoUrl(photoUrl);
    }

    // Fetch current photo URL so we can clean up the old GCS object if it changes
    const existingUser =
      photoUrl !== undefined
        ? await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { photo_url: true },
          })
        : null;

    try {
      const updated = await this.prisma.client.user.update({
        where: { id: userId },
        data: {
          display_name: displayName,
          ...(photoUrl !== undefined
            ? { photo_url: photoUrl?.trim() || null }
            : {}),
        },
      });

      // Delete old GCS object after the DB write succeeds
      if (photoUrl !== undefined && existingUser?.photo_url) {
        const oldObjectPath = this.extractGcsObjectPath(existingUser.photo_url);
        if (oldObjectPath) {
          this.deleteGcsObject(oldObjectPath, userId, "display_name_update");
        }
      }

      if (photoUrl !== undefined) {
        const newObjectPath = photoUrl
          ? this.extractGcsObjectPath(photoUrl)
          : null;
        if (photoUrl) {
          this.logger.log({
            event: "profile_photo_uploaded",
            userId,
            objectPath: newObjectPath,
          });
        } else {
          this.logger.log({
            event: "profile_photo_removed",
            userId,
            previousObjectPath: existingUser?.photo_url
              ? this.extractGcsObjectPath(existingUser.photo_url)
              : null,
          });
        }
      }

      return updated;
    } catch (error) {
      if (isPrismaRecordNotFoundError(error)) {
        throw new NotFoundException("User not found");
      }

      throw error;
    }
  }

  async createProfilePhotoUploadUrl(
    userId: number,
    contentType: string,
    sizeBytes: number,
    actor: { id: number; role: UserRole },
  ) {
    if (actor.role !== UserRole.ADMIN && actor.id !== userId) {
      throw new ForbiddenException(
        "You can only update your own profile photo",
      );
    }

    const normalizedType = contentType.trim().toLowerCase();

    if (!SUPPORTED_IMAGE_TYPES.has(normalizedType)) {
      throw new BadRequestException("Unsupported image type");
    }

    if (
      !Number.isFinite(sizeBytes) ||
      sizeBytes < 1 ||
      sizeBytes > PROFILE_PHOTO_MAX_BYTES
    ) {
      throw new BadRequestException("Image exceeds size limit (2MB)");
    }

    const bucket = this.firebaseAdminService.getProfilePhotoBucket();
    const safeExt =
      normalizedType === "image/png"
        ? "png"
        : normalizedType === "image/webp"
          ? "webp"
          : "jpg";
    const objectPath = `profile-photos/user-${userId}/${Date.now()}-${randomUUID()}.${safeExt}`;
    const file = bucket.file(objectPath);
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: expiresAt,
      contentType: normalizedType,
    });

    const encodedPath = objectPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const photoUrl = `https://storage.googleapis.com/${bucket.name}/${encodedPath}`;

    this.logger.log({
      event: "profile_photo_upload_url_created",
      userId,
      objectPath,
      contentType: normalizedType,
      sizeBytes,
    });

    return {
      uploadUrl,
      photoUrl,
      objectPath,
      expiresAt,
      maxBytes: PROFILE_PHOTO_MAX_BYTES,
    };
  }

  /**
   * Extracts the GCS object path from a public GCS URL.
   * Returns null if the URL does not match the expected format.
   */
  private extractGcsObjectPath(photoUrl: string): string | null {
    try {
      const url = new URL(photoUrl);
      if (url.hostname !== "storage.googleapis.com") return null;
      // pathname is /<bucketName>/<objectPath>
      const parts = url.pathname.split("/").slice(2); // drop leading '' and bucketName
      if (parts.length === 0) return null;
      return parts.map(decodeURIComponent).join("/");
    } catch {
      return null;
    }
  }

  /**
   * Deletes a GCS object in the background (fire-and-forget).
   * Logs but does not throw on failure so the main flow is not disrupted.
   */
  private deleteGcsObject(
    objectPath: string,
    userId: number,
    reason: string,
  ): void {
    this.firebaseAdminService
      .getProfilePhotoBucket()
      .file(objectPath)
      .delete({ ignoreNotFound: true })
      .then(() => {
        this.logger.log({
          event: "profile_photo_deleted",
          userId,
          objectPath,
          reason,
        });
      })
      .catch((err: unknown) => {
        this.logger.warn({
          event: "profile_photo_delete_failed",
          userId,
          objectPath,
          reason,
          error: String(err),
        });
      });
  }

  private assertValidPhotoUrl(urlValue: string) {
    let parsed: URL;

    try {
      parsed = new URL(urlValue);
    } catch {
      throw new BadRequestException("photoUrl must be a valid URL");
    }

    if (parsed.protocol !== "https:") {
      throw new BadRequestException("photoUrl must use https");
    }
  }

  async updateSeasonUserTeamName(
    seasonUserId: string,
    teamName: string,
    actor: { id: number; role: UserRole },
  ) {
    const seasonUser = await this.prisma.client.seasonUser.findUnique({
      where: { id: seasonUserId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!seasonUser) {
      throw new NotFoundException("Season user not found");
    }

    if (actor.role !== UserRole.ADMIN && seasonUser.userId !== actor.id) {
      throw new ForbiddenException("You can only update your own team name");
    }

    try {
      return await this.prisma.client.seasonUser.update({
        where: { id: seasonUserId },
        data: { teamName },
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (isPrismaRecordNotFoundError(error)) {
        throw new NotFoundException("Season user not found");
      }

      throw error;
    }
  }
}
