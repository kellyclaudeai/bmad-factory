import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import type { WorkspaceInvite } from "@/lib/types/models";

const DEFAULT_INVITE_BASE_URL = "https://slacklite.app";
const INVITE_TOKEN_BYTE_LENGTH = 16;
const INVITE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

interface CreateWorkspaceInviteInput {
  firestore: Firestore;
  workspaceId: string;
  createdBy: string;
  workspaceName?: string;
}

export interface CreateWorkspaceInviteResult {
  inviteId: string;
  workspaceId: string;
  token: string;
  createdBy: string;
  expiresAt: Timestamp;
  workspaceName?: string;
}

interface ResolveWorkspaceInviteInput {
  firestore: Firestore;
  workspaceId: string;
  token: string;
}

interface JoinWorkspaceFromInviteInput {
  firestore: Firestore;
  userId: string;
  workspaceId: string;
}

function normalizeRequiredString(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizeOptionalString(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseInviteDocument(
  value: Record<string, unknown>,
  fallbackInviteId: string,
): WorkspaceInvite | null {
  const inviteId =
    typeof value.inviteId === "string" && value.inviteId.trim().length > 0
      ? value.inviteId.trim()
      : fallbackInviteId;
  const workspaceId =
    typeof value.workspaceId === "string" ? value.workspaceId.trim() : "";
  const token = typeof value.token === "string" ? value.token.trim() : "";
  const createdBy =
    typeof value.createdBy === "string" ? value.createdBy.trim() : "";

  if (
    workspaceId.length === 0 ||
    token.length === 0 ||
    createdBy.length === 0 ||
    !(value.expiresAt instanceof Timestamp)
  ) {
    return null;
  }

  const workspaceName =
    typeof value.workspaceName === "string" && value.workspaceName.trim().length > 0
      ? value.workspaceName.trim()
      : undefined;
  const createdAt = value.createdAt instanceof Timestamp ? value.createdAt : undefined;

  return {
    inviteId,
    workspaceId,
    token,
    createdBy,
    expiresAt: value.expiresAt,
    createdAt,
    workspaceName,
  };
}

/**
 * Generates a random hex token for workspace invite links.
 */
export function generateWorkspaceInviteToken(
  byteLength = INVITE_TOKEN_BYTE_LENGTH,
): string {
  if (!Number.isInteger(byteLength) || byteLength <= 0) {
    throw new Error("byteLength must be a positive integer.");
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 2 + byteLength * 2)}`;
}

/**
 * Builds invite route path used by the app router.
 */
export function buildWorkspaceInvitePath(workspaceId: string, token: string): string {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedToken = normalizeRequiredString(token, "token");

  return `/invite/${encodeURIComponent(normalizedWorkspaceId)}/${encodeURIComponent(normalizedToken)}`;
}

/**
 * Builds an absolute invite URL from a workspace ID and token.
 */
export function buildWorkspaceInviteUrl(
  workspaceId: string,
  token: string,
  baseUrl?: string,
): string {
  const path = buildWorkspaceInvitePath(workspaceId, token);
  const normalizedBaseUrl =
    normalizeOptionalString(baseUrl)?.replace(/\/+$/, "") ?? DEFAULT_INVITE_BASE_URL;

  return `${normalizedBaseUrl}${path}`;
}

/**
 * Creates and stores a new workspace invite document.
 */
export async function createWorkspaceInvite({
  firestore,
  workspaceId,
  createdBy,
  workspaceName,
}: CreateWorkspaceInviteInput): Promise<CreateWorkspaceInviteResult> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedCreatedBy = normalizeRequiredString(createdBy, "createdBy");
  const normalizedWorkspaceName = normalizeOptionalString(workspaceName) ?? undefined;
  const inviteRef = doc(collection(firestore, "workspaceInvites"));
  const token = generateWorkspaceInviteToken();
  const expiresAt = Timestamp.fromMillis(Date.now() + INVITE_EXPIRATION_MS);

  await setDoc(inviteRef, {
    inviteId: inviteRef.id,
    workspaceId: normalizedWorkspaceId,
    token,
    createdBy: normalizedCreatedBy,
    expiresAt,
    createdAt: serverTimestamp(),
    ...(normalizedWorkspaceName ? { workspaceName: normalizedWorkspaceName } : {}),
  });

  return {
    inviteId: inviteRef.id,
    workspaceId: normalizedWorkspaceId,
    token,
    createdBy: normalizedCreatedBy,
    expiresAt,
    ...(normalizedWorkspaceName ? { workspaceName: normalizedWorkspaceName } : {}),
  };
}

/**
 * Fetches and validates an invite using route params.
 */
export async function resolveWorkspaceInvite({
  firestore,
  workspaceId,
  token,
}: ResolveWorkspaceInviteInput): Promise<WorkspaceInvite | null> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedToken = normalizeRequiredString(token, "token");
  const inviteQuery = query(
    collection(firestore, "workspaceInvites"),
    where("workspaceId", "==", normalizedWorkspaceId),
    where("token", "==", normalizedToken),
    limit(1),
  );
  const inviteSnapshot = await getDocs(inviteQuery);

  if (inviteSnapshot.empty) {
    return null;
  }

  const inviteDoc = inviteSnapshot.docs[0];
  const invite = parseInviteDocument(
    inviteDoc.data() as Record<string, unknown>,
    inviteDoc.id,
  );

  if (!invite) {
    return null;
  }

  if (invite.expiresAt.toMillis() <= Date.now()) {
    return null;
  }

  return invite;
}

/**
 * Updates the authenticated user with the workspace selected by invite.
 */
export async function joinWorkspaceFromInvite({
  firestore,
  userId,
  workspaceId,
}: JoinWorkspaceFromInviteInput): Promise<void> {
  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");

  await updateDoc(doc(firestore, "users", normalizedUserId), {
    workspaceId: normalizedWorkspaceId,
  });
}
