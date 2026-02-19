import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function toNonEmptyString(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

const projectId =
  toNonEmptyString(process.env.FIREBASE_PROJECT_ID) ??
  toNonEmptyString(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const clientEmail = toNonEmptyString(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = toNonEmptyString(process.env.FIREBASE_PRIVATE_KEY)?.replace(
  /\\n/g,
  "\n",
);
const usesAuthEmulator =
  toNonEmptyString(process.env.FIREBASE_AUTH_EMULATOR_HOST) !== null;
const hasServiceAccountCredentials =
  projectId !== null &&
  clientEmail !== null &&
  privateKey !== null;

if (!getApps().length) {
  if (hasServiceAccountCredentials) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // For local development and E2E emulator runs, project-only init is sufficient.
    initializeApp(projectId ? { projectId } : undefined);
  }

  if (!hasServiceAccountCredentials && !usesAuthEmulator) {
    console.warn(
      "[firebase-admin] Service account credentials were not provided. " +
        "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY " +
        "for non-emulator environments.",
    );
  }
}

export const adminAuth = getAuth();
export const verifyIdToken = (token: string, checkRevoked = false) =>
  adminAuth.verifyIdToken(token, checkRevoked);
