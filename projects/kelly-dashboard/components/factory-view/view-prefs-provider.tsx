"use client";

import * as React from "react";
import {
  readUiPrefs,
  writeUiPrefs,
  type UiPrefs,
} from "@/lib/ui-prefs";

export type ViewPrefsContextValue = {
  compactMode: boolean;
  showDescriptions: boolean;
  collapsedSections: Record<string, boolean>;
  setCompactMode: (next: boolean) => void;
  setShowDescriptions: (next: boolean) => void;
  setSectionCollapsed: (id: string, collapsed: boolean) => void;
  collapseAll: (sectionIds: string[]) => void;
  expandAll: (sectionIds: string[]) => void;
};

const ViewPrefsContext = React.createContext<ViewPrefsContextValue | null>(null);

function prefsToState(prefs: UiPrefs) {
  return {
    compactMode: prefs.compactMode ?? false,
    showDescriptions: prefs.showDescriptions ?? true,
    collapsedSections: prefs.collapsedSections ?? {},
  };
}

export function ViewPrefsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(() => prefsToState(readUiPrefs()));

  const persist = React.useCallback((next: ReturnType<typeof prefsToState>) => {
    const prefs: UiPrefs = {
      compactMode: next.compactMode,
      showDescriptions: next.showDescriptions,
      collapsedSections: next.collapsedSections,
    };
    writeUiPrefs(prefs);
  }, []);

  const setCompactMode = React.useCallback(
    (nextCompact: boolean) => {
      setState((prev) => {
        const next = { ...prev, compactMode: nextCompact };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setShowDescriptions = React.useCallback(
    (nextShow: boolean) => {
      setState((prev) => {
        const next = { ...prev, showDescriptions: nextShow };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setSectionCollapsed = React.useCallback(
    (id: string, collapsed: boolean) => {
      setState((prev) => {
        const next = {
          ...prev,
          collapsedSections: { ...prev.collapsedSections, [id]: collapsed },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const collapseAll = React.useCallback(
    (sectionIds: string[]) => {
      setState((prev) => {
        const nextCollapsed = { ...prev.collapsedSections };
        for (const id of sectionIds) nextCollapsed[id] = true;
        const next = { ...prev, collapsedSections: nextCollapsed };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const expandAll = React.useCallback(
    (sectionIds: string[]) => {
      setState((prev) => {
        const nextCollapsed = { ...prev.collapsedSections };
        for (const id of sectionIds) nextCollapsed[id] = false;
        const next = { ...prev, collapsedSections: nextCollapsed };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value: ViewPrefsContextValue = {
    compactMode: state.compactMode,
    showDescriptions: state.showDescriptions,
    collapsedSections: state.collapsedSections,
    setCompactMode,
    setShowDescriptions,
    setSectionCollapsed,
    collapseAll,
    expandAll,
  };

  return <ViewPrefsContext.Provider value={value}>{children}</ViewPrefsContext.Provider>;
}

export function useViewPrefs() {
  const ctx = React.useContext(ViewPrefsContext);
  if (!ctx) throw new Error("useViewPrefs must be used within ViewPrefsProvider");
  return ctx;
}
