import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";

interface StartDMInput {
  firestore: Firestore;
  workspaceId: string;
  currentUserId: string;
  otherUserId: string;
}

function normalizeRequiredString(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

export async function startDM({
  firestore,
  workspaceId,
  currentUserId,
  otherUserId,
}: StartDMInput): Promise<string> {
  const normalizedWorkspaceId = normalizeRequiredString(workspaceId, "workspaceId");
  const normalizedCurrentUserId = normalizeRequiredString(currentUserId, "currentUserId");
  const normalizedOtherUserId = normalizeRequiredString(otherUserId, "otherUserId");

  if (normalizedCurrentUserId === normalizedOtherUserId) {
    throw new Error("Cannot start a DM with yourself.");
  }

  const userIds = [normalizedCurrentUserId, normalizedOtherUserId].sort();
  const directMessagesCollectionRef = collection(
    firestore,
    "workspaces",
    normalizedWorkspaceId,
    "directMessages",
  );

  const directMessagesSnapshot = await getDocs(
    query(
      directMessagesCollectionRef,
      where("workspaceId", "==", normalizedWorkspaceId),
      where("userIds", "array-contains", normalizedCurrentUserId),
    ),
  );

  const existingDirectMessage = directMessagesSnapshot.docs.find((documentSnapshot) => {
    const directMessageData = documentSnapshot.data();
    const directMessageUserIds = directMessageData.userIds;

    return (
      Array.isArray(directMessageUserIds) &&
      directMessageUserIds.length === 2 &&
      directMessageUserIds.includes(normalizedCurrentUserId) &&
      directMessageUserIds.includes(normalizedOtherUserId)
    );
  });

  if (existingDirectMessage) {
    return existingDirectMessage.id;
  }

  const directMessageRef = doc(directMessagesCollectionRef);

  await setDoc(directMessageRef, {
    dmId: directMessageRef.id,
    workspaceId: normalizedWorkspaceId,
    userIds,
    createdAt: serverTimestamp(),
    lastMessageAt: null,
  });

  return directMessageRef.id;
}
