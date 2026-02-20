/**
 * Module-level cache for newly-created channel names.
 * Populated before router.push() so the channel page can read
 * the name immediately without waiting for Firestore to return it.
 */
const cache = new Map<string, string>();

export function setChannelNameInCache(channelId: string, name: string): void {
  cache.set(channelId, name);
}

export function getChannelNameFromCache(channelId: string): string {
  return cache.get(channelId) ?? "";
}
