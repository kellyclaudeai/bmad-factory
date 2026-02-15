// Shared UI preference persistence helpers.
// Keep these tiny + defensive: localStorage may be unavailable (SSR, privacy mode, etc.).

export const UI_PREFS_STORAGE_KEY = "kelly-dashboard:ui-prefs";

export type UiPrefs = {
  showDescriptions?: boolean;
  // sectionId -> collapsed?
  collapsedSections?: Record<string, boolean>;
};

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readUiPrefs(): UiPrefs {
  if (!canUseLocalStorage()) return {};
  return safeParseJson<UiPrefs>(window.localStorage.getItem(UI_PREFS_STORAGE_KEY)) ?? {};
}

export function writeUiPrefs(next: UiPrefs) {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(UI_PREFS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort; ignore quota/security errors
  }
}

export function readCollapsedSection(sectionId: string): boolean | undefined {
  const prefs = readUiPrefs();
  return prefs.collapsedSections?.[sectionId];
}

export function writeCollapsedSection(sectionId: string, collapsed: boolean) {
  const prefs = readUiPrefs();
  const collapsedSections = { ...(prefs.collapsedSections ?? {}), [sectionId]: collapsed };
  writeUiPrefs({ ...prefs, collapsedSections });
}
