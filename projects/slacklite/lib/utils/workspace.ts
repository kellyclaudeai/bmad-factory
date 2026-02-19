import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";

import type { Channel } from "@/lib/types/models";
import { validateWorkspaceName } from "@/lib/utils/validation";

export const DEFAULT_GENERAL_CHANNEL_NAME = "general";

interface CreateWorkspaceInput {
  firestore: Firestore;
  name: string;
  userId: string;
}

interface CreateGeneralChannelInput {
  firestore: Firestore;
  workspaceId: string;
  userId: string;
}

interface EnsureWorkspaceHasDefaultChannelInput {
  firestore: Firestore;
  workspaceId: string;
  userId: string;
}

export interface CreateWorkspaceResult {
  workspaceId: string;
  defaultChannelId: string;
}

interface LandingChannel {
  channelId: string;
  name: string;
}

function normalizeRequiredString(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

export function isGeneralChannelName(channelName: string): boolean {
  return channelName.trim().toLowerCase() === DEFAULT_GENERAL_CHANNEL_NAME;
}

export function canDeleteChannel(channel: Pick<Channel, "name">): true {
  if (isGeneralChannelName(channel.name)) {
    throw new Error("Cannot delete #general channel");
  }

  return true;
}

export function getWorkspaceLandingChannelId(
  channels: LandingChannel[],
): string | null {
  if (channels.length === 0) {
    return null;
  }

  const generalChannel = channels.find((channel) =>
    isGeneralChannelName(channel.name),
  );

  return generalChannel?.channelId ?? channels[0].channelId;
}

export async function createGeneralChannel({
  firestore,
  workspaceId,
  userId,
}: CreateGeneralChannelInput): Promise<string> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const channelsCollectionRef = collection(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "channels",
  );
  const generalChannelRef = doc(channelsCollectionRef);

  await setDoc(generalChannelRef, {
    channelId: generalChannelRef.id,
    workspaceId: normalizedWorkspaceId,
    name: DEFAULT_GENERAL_CHANNEL_NAME,
    createdBy: normalizedUserId,
    createdAt: serverTimestamp(),
    lastMessageAt: null,
    messageCount: 0,
  });

  return generalChannelRef.id;
}

export async function createWorkspace({
  firestore,
  name,
  userId,
}: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
  const normalizedWorkspaceName = normalizeRequiredString(name, "Workspace name");
  const workspaceNameValidation = validateWorkspaceName(normalizedWorkspaceName);

  if (!workspaceNameValidation.valid) {
    throw new Error(workspaceNameValidation.error ?? "Workspace name must be 1-50 characters.");
  }

  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const workspaceRef = doc(collection(firestore, "workspaces"));

  await setDoc(workspaceRef, {
    workspaceId: workspaceRef.id,
    name: normalizedWorkspaceName,
    ownerId: normalizedUserId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(firestore, "users", normalizedUserId), {
    workspaceId: workspaceRef.id,
  });

  const defaultChannelId = await createGeneralChannel({
    firestore,
    workspaceId: workspaceRef.id,
    userId: normalizedUserId,
  });

  return {
    workspaceId: workspaceRef.id,
    defaultChannelId,
  };
}

export async function ensureWorkspaceHasDefaultChannel({
  firestore,
  workspaceId,
  userId,
}: EnsureWorkspaceHasDefaultChannelInput): Promise<string | null> {
  const normalizedWorkspaceId = workspaceId.trim();
  const normalizedUserId = userId.trim();

  if (normalizedWorkspaceId.length === 0 || normalizedUserId.length === 0) {
    return null;
  }

  const channelsCollectionRef = collection(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "channels",
  );
  const existingChannelsSnapshot = await getDocs(
    query(channelsCollectionRef, limit(1)),
  );

  if (!existingChannelsSnapshot.empty) {
    return existingChannelsSnapshot.docs[0].id;
  }

  return createGeneralChannel({
    firestore,
    workspaceId: normalizedWorkspaceId,
    userId: normalizedUserId,
  });
}
