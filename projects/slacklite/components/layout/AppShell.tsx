"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { MOBILE_SIDEBAR_WIDTH, Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";

export interface AppShellProps {
  children: ReactNode;
  workspaceName?: string;
  rightPanel?: ReactNode;
}

const MOBILE_BREAKPOINT = 1024;
const EDGE_ACTIVATION_WIDTH = 50;
const SWIPE_DISTANCE_THRESHOLD = 50;
const SNAP_OPEN_RATIO = 0.5;
const AXIS_LOCK_THRESHOLD = 8;

type GestureMode = "open" | "close" | null;
type GestureAxis = "none" | "horizontal" | "vertical";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function toOpenProgress(translateX: number): number {
  return clamp((translateX + MOBILE_SIDEBAR_WIDTH) / MOBILE_SIDEBAR_WIDTH, 0, 1);
}

export function AppShell({
  children,
  workspaceName = "SlackLite Workspace",
  rightPanel,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileSidebarTranslateX, setMobileSidebarTranslateX] = useState<number | null>(null);
  const [isGestureDragging, setIsGestureDragging] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const gestureModeRef = useRef<GestureMode>(null);
  const gestureAxisRef = useRef<GestureAxis>("none");
  const gestureStartXRef = useRef(0);
  const gestureStartYRef = useRef(0);
  const gestureCurrentXRef = useRef(0);
  const gestureActiveRef = useRef(false);
  const mobileSidebarTranslateXRef = useRef<number | null>(null);

  const setSidebarTranslateX = useCallback((value: number | null) => {
    mobileSidebarTranslateXRef.current = value;
    setMobileSidebarTranslateX(value);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobileViewport(isMobile);

      if (!isMobile) {
        setSidebarTranslateX(null);
        setIsGestureDragging(false);
        gestureActiveRef.current = false;
        gestureModeRef.current = null;
        gestureAxisRef.current = "none";
      }
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, [setSidebarTranslateX]);

  const resetGesture = useCallback(() => {
    gestureActiveRef.current = false;
    gestureModeRef.current = null;
    gestureAxisRef.current = "none";
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSidebarTranslateX(null);
    setIsGestureDragging(false);
    resetGesture();
  }, [resetGesture, setSidebarTranslateX]);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    setSidebarTranslateX(null);
    setIsGestureDragging(false);
    resetGesture();
  }, [resetGesture, setSidebarTranslateX]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobileViewport || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      let mode: GestureMode = null;
      if (!isSidebarOpen && startX < EDGE_ACTIVATION_WIDTH) {
        mode = "open";
      } else if (isSidebarOpen && startX <= MOBILE_SIDEBAR_WIDTH) {
        mode = "close";
      }

      if (!mode) {
        return;
      }

      gestureActiveRef.current = true;
      gestureModeRef.current = mode;
      gestureAxisRef.current = "none";
      gestureStartXRef.current = startX;
      gestureStartYRef.current = startY;
      gestureCurrentXRef.current = startX;
      setIsGestureDragging(true);
      setSidebarTranslateX(mode === "open" ? -MOBILE_SIDEBAR_WIDTH : 0);
    },
    [isMobileViewport, isSidebarOpen, setSidebarTranslateX],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobileViewport || !gestureActiveRef.current || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      gestureCurrentXRef.current = currentX;

      const deltaX = currentX - gestureStartXRef.current;
      const deltaY = currentY - gestureStartYRef.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (gestureAxisRef.current === "none") {
        if (absDeltaX < AXIS_LOCK_THRESHOLD && absDeltaY < AXIS_LOCK_THRESHOLD) {
          return;
        }

        gestureAxisRef.current = absDeltaY > absDeltaX ? "vertical" : "horizontal";
      }

      if (gestureAxisRef.current !== "horizontal") {
        return;
      }

      event.preventDefault();

      if (gestureModeRef.current === "open") {
        const nextTranslateX = clamp(
          -MOBILE_SIDEBAR_WIDTH + Math.max(0, deltaX),
          -MOBILE_SIDEBAR_WIDTH,
          0,
        );
        setSidebarTranslateX(nextTranslateX);
        return;
      }

      if (gestureModeRef.current === "close") {
        const nextTranslateX = clamp(Math.min(0, deltaX), -MOBILE_SIDEBAR_WIDTH, 0);
        setSidebarTranslateX(nextTranslateX);
      }
    },
    [isMobileViewport, setSidebarTranslateX],
  );

  const finalizeTouchGesture = useCallback(
    (event?: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobileViewport || !gestureActiveRef.current) {
        return;
      }

      const finalTouch = event?.changedTouches?.[0];
      if (finalTouch) {
        gestureCurrentXRef.current = finalTouch.clientX;
      }

      const mode = gestureModeRef.current;
      const axis = gestureAxisRef.current;
      const deltaX = gestureCurrentXRef.current - gestureStartXRef.current;
      const swipeDistance = Math.abs(deltaX);
      const crossedDistanceThreshold = swipeDistance > SWIPE_DISTANCE_THRESHOLD;
      const currentTranslateX =
        mobileSidebarTranslateXRef.current ?? (isSidebarOpen ? 0 : -MOBILE_SIDEBAR_WIDTH);
      const openProgress = toOpenProgress(currentTranslateX);
      const crossedOpenSnapPoint = openProgress > SNAP_OPEN_RATIO;
      const crossedCloseSnapPoint = openProgress < SNAP_OPEN_RATIO;

      let nextSidebarOpenState = isSidebarOpen;

      if (mode === "open") {
        nextSidebarOpenState =
          axis === "horizontal" &&
          crossedDistanceThreshold &&
          deltaX > 0 &&
          crossedOpenSnapPoint;
      } else if (mode === "close") {
        const shouldClose =
          axis === "horizontal" &&
          crossedDistanceThreshold &&
          deltaX < 0 &&
          crossedCloseSnapPoint;

        nextSidebarOpenState = !shouldClose;
      }

      setIsSidebarOpen(nextSidebarOpenState);
      setIsGestureDragging(false);
      setSidebarTranslateX(null);
      resetGesture();
    },
    [isMobileViewport, isSidebarOpen, resetGesture, setSidebarTranslateX],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      finalizeTouchGesture(event);
    },
    [finalizeTouchGesture],
  );

  const handleTouchCancel = useCallback(() => {
    finalizeTouchGesture();
  }, [finalizeTouchGesture]);

  const sidebarOpenProgress =
    mobileSidebarTranslateX === null
      ? isSidebarOpen
        ? 1
        : 0
      : toOpenProgress(mobileSidebarTranslateX);
  const shouldShowBackdrop = isSidebarOpen || mobileSidebarTranslateX !== null;
  const backdropOpacity = clamp(sidebarOpenProgress * 0.5, 0, 0.5);

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-base text-primary"
      data-testid="app-shell"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="fixed left-3 top-3 z-30 h-11 w-11 p-0 text-2xl leading-none lg:hidden"
        onClick={openSidebar}
        aria-label="Open sidebar menu"
      >
        ☰
      </Button>

      {shouldShowBackdrop ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black lg:hidden"
          style={{ opacity: backdropOpacity }}
          onClick={isSidebarOpen ? closeSidebar : undefined}
        />
      ) : null}

      <Sidebar
        workspaceName={workspaceName}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        mobileTranslateX={mobileSidebarTranslateX}
        isGestureDragging={isGestureDragging}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-surface-2">
        <Header />

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto bg-surface-2 p-4 sm:p-6 lg:p-8">{children}</main>
          {rightPanel ? (
            <aside className="hidden w-72 flex-none border-l border-border bg-surface-2 xl:block">
              {rightPanel}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
