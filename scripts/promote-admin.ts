/**
 * Bootstrap script: promote a user to ADMIN role.
 *
 * Sets the role in the DB and syncs it to Firebase custom JWT claims,
 * so the fast-path in AppUserGuard works for the user immediately after
 * their next token refresh (within ~1h, or force-refresh client-side).
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts --email user@example.com
 *
 * Required env vars (same as the API):
 *   DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { PrismaClient } from "../generated/prisma/client.js";

const emailArg = process.argv.indexOf("--email");
const email = emailArg !== -1 ? process.argv[emailArg + 1] : null;

if (!email) {
  console.error("Usage: npx tsx scripts/promote-admin.ts --email user@example.com");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

const app =
  getApps().find((a) => a.name === "promote-admin") ??
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, "promote-admin");

const auth = getAuth(app);
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, email: true, role: true, display_name: true, auth_subject: true },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: id=${user.id}, displayName="${user.display_name}", currentRole=${user.role}`);

  if (user.role === "ADMIN") {
    console.log("User is already ADMIN.");
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    console.log("DB role updated to ADMIN.");
  }

  if (user.auth_subject) {
    await auth.setCustomUserClaims(user.auth_subject, { role: "ADMIN" });
    console.log(`Firebase custom claims set for uid=${user.auth_subject}.`);
    console.log("The user must refresh their Firebase ID token to pick up the new claim.");
    console.log("They can do this by signing out and back in, or the token refreshes automatically within 1 hour.");
  } else {
    console.warn("User has no auth_subject — Firebase claims not updated. User must log in at least once first.");
  }

  console.log("Done.");
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
