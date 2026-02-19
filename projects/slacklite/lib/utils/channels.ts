import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";

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
