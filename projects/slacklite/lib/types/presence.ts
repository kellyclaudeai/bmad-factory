export interface PresenceData {
  online: boolean;
  lastSeen: number | null;
  lastSeenAt: number | null;
}

export type PresenceMap = Record<string, PresenceData>;

export interface PresenceConnectionState {
  isConnected: boolean;
  isMonitoring: boolean;
  lastChangedAt: number | null;
}

export interface UsePresenceResult {
  connectionState: PresenceConnectionState;
  error: string | null;
}

export interface UsePresenceUpdatesResult {
  presence: PresenceMap;
  loading: boolean;
  error: string | null;
}
