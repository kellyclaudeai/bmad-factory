import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
  type Firestore,
} from "firebase/firestore";

import { getChannelNameValidationError } from "@/lib/utils/channelName";
import { canDeleteChannel, isGeneralChannelName } from "@/lib/utils/workspace";

function normalizeRequiredString(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

export async function createChannel(
  firestore: Firestore,
  workspaceId: string,
  name: string,
  userId: string,
): Promise<string> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedName = normalizeRequiredString(name, "Channel name");
  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const channelNameValidationError = getChannelNameValidationError(normalizedName);

  if (channelNameValidationError) {
    throw new Error(channelNameValidationError);
  }

  const existingChannelSnapshot = await getDocs(
    query(
      collectionGroup(firestore, "channels"),
      where("workspaceId", "==", normalizedWorkspaceId),
      where("name", "==", normalizedName),
      limit(1),
    ),
  );

  if (!existingChannelSnapshot.empty) {
    throw new Error("Channel name already exists");
  }

  const channelsCollectionRef = collection(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "channels",
  );
  const channelRef = doc(channelsCollectionRef);

  await setDoc(channelRef, {
    channelId: channelRef.id,
    workspaceId: normalizedWorkspaceId,
    name: normalizedName,
    createdBy: normalizedUserId,
    createdAt: serverTimestamp(),
    lastMessageAt: null,
    messageCount: 0,
  });

  return channelRef.id;
}

interface RenameChannelInput {
  firestore: Firestore;
  workspaceId: string;
  channelId: string;
  currentName: string;
  newName: string;
  userId: string;
  channelCreatedBy: string;
  workspaceOwnerId?: string;
}

export async function renameChannel({
  firestore,
  workspaceId,
  channelId,
  currentName,
  newName,
  userId,
  channelCreatedBy,
  workspaceOwnerId,
}: RenameChannelInput): Promise<void> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedChannelId = normalizeRequiredString(channelId, "channelId");
  const normalizedCurrentName = normalizeRequiredString(currentName, "currentName");
  const normalizedNewName = normalizeRequiredString(newName, "Channel name");
  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const normalizedChannelCreatedBy = normalizeRequiredString(
    channelCreatedBy,
    "channelCreatedBy",
  );
  const normalizedWorkspaceOwnerId =
    typeof workspaceOwnerId === "string" ? workspaceOwnerId.trim() : "";

  if (isGeneralChannelName(normalizedCurrentName)) {
    throw new Error("Cannot rename #general channel");
  }

  const channelNameValidationError = getChannelNameValidationError(normalizedNewName);

  if (channelNameValidationError) {
    throw new Error(channelNameValidationError);
  }

  const canRenameChannel =
    normalizedUserId === normalizedChannelCreatedBy ||
    (normalizedWorkspaceOwnerId.length > 0 &&
      normalizedUserId === normalizedWorkspaceOwnerId);

  if (!canRenameChannel) {
    throw new Error("You do not have permission to rename this channel");
  }

  const channelsCollectionRef = collection(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "channels",
  );
  const existingChannelSnapshot = await getDocs(
    query(
      channelsCollectionRef,
      where("name", "==", normalizedNewName),
      limit(1),
    ),
  );
  const duplicateExists = existingChannelSnapshot.docs.some(
    (channelDocumentSnapshot) => channelDocumentSnapshot.id !== normalizedChannelId,
  );

  if (duplicateExists) {
    throw new Error("Channel name already exists");
  }

  const channelRef = doc(channelsCollectionRef, normalizedChannelId);
  await updateDoc(channelRef, { name: normalizedNewName });
}

interface DeleteChannelInput {
  firestore: Firestore;
  workspaceId: string;
  channelId: string;
  channelName: string;
  userId: string;
  channelCreatedBy: string;
  workspaceOwnerId?: string;
}

const DELETE_BATCH_SIZE = 500;

export async function deleteChannel({
  firestore,
  workspaceId,
  channelId,
  channelName,
  userId,
  channelCreatedBy,
  workspaceOwnerId,
}: DeleteChannelInput): Promise<void> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedChannelId = normalizeRequiredString(channelId, "channelId");
  const normalizedChannelName = normalizeRequiredString(channelName, "channelName");
  const normalizedUserId = normalizeRequiredString(userId, "userId");
  const normalizedChannelCreatedBy = normalizeRequiredString(
    channelCreatedBy,
    "channelCreatedBy",
  );
  const normalizedWorkspaceOwnerId =
    typeof workspaceOwnerId === "string" ? workspaceOwnerId.trim() : "";

  canDeleteChannel({ name: normalizedChannelName });

  const canDelete =
    normalizedUserId === normalizedChannelCreatedBy ||
    (normalizedWorkspaceOwnerId.length > 0 &&
      normalizedUserId === normalizedWorkspaceOwnerId);

  if (!canDelete) {
    throw new Error("You do not have permission to delete this channel");
  }

  const channelRef = doc(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "channels",
    normalizedChannelId,
  );
  const messagesCollectionRef = collection(channelRef, "messages");

  while (true) {
    const messageSnapshot = await getDocs(
      query(messagesCollectionRef, limit(DELETE_BATCH_SIZE)),
    );

    if (messageSnapshot.empty) {
      break;
    }

    const batch = writeBatch(firestore);

    messageSnapshot.docs.forEach((documentSnapshot) => {
      batch.delete(documentSnapshot.ref);
    });

    await batch.commit();
  }

  await deleteDoc(channelRef);
}
