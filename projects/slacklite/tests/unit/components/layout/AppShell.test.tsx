import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

vi.mock("@/components/layout/Header", () => ({
  Header: () => <header>Header</header>,
}));

vi.mock("@/components/layout/Sidebar", () => ({
  MOBILE_SIDEBAR_WIDTH: 280,
  Sidebar: ({
    isOpen,
    mobileTranslateX,
    isGestureDragging,
  }: {
    isOpen: boolean;
    mobileTranslateX?: number | null;
    isGestureDragging?: boolean;
  }) => (
    <aside
      aria-label="Workspace sidebar"
      data-dragging={isGestureDragging ? "true" : "false"}
      data-open={isOpen ? "true" : "false"}
      style={
        typeof mobileTranslateX === "number"
          ? { transform: `translateX(${mobileTranslateX}px)` }
          : undefined
      }
    />
  ),
}));

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });

  window.dispatchEvent(new Event("resize"));
}

function touchStart(target: Element, x: number, y: number): void {
  fireEvent.touchStart(target, {
    changedTouches: [{ clientX: x, clientY: y }],
    touches: [{ clientX: x, clientY: y }],
  });
}

function touchMove(target: Element, x: number, y: number): void {
  fireEvent.touchMove(target, {
    changedTouches: [{ clientX: x, clientY: y }],
    touches: [{ clientX: x, clientY: y }],
  });
}

function touchEnd(target: Element, x: number, y: number): void {
  fireEvent.touchEnd(target, {
    changedTouches: [{ clientX: x, clientY: y }],
    touches: [],
  });
}

describe("AppShell touch gestures", () => {
  beforeEach(() => {
    setViewportWidth(390);
  });

  it("opens the sidebar on right swipe from the left edge", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    touchStart(shell, 20, 120);
    touchMove(shell, 220, 126);
    touchEnd(shell, 220, 126);

    expect(sidebar).toHaveAttribute("data-open", "true");
  });

  it("closes the sidebar on left swipe when open", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar menu" }));
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 180, 140);
    touchMove(shell, 20, 144);
    touchEnd(shell, 20, 144);

    expect(sidebar).toHaveAttribute("data-open", "false");
  });

  it("does not close when left swipe distance is 50px or less", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar menu" }));
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 180, 140);
    touchMove(shell, 130, 143);
    touchEnd(shell, 130, 143);

    expect(sidebar).toHaveAttribute("data-open", "true");
  });

  it("snaps back open when closing gesture does not cross 50% of sidebar width", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar menu" }));
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 200, 140);
    touchMove(shell, 120, 145);
    touchEnd(shell, 120, 145);

    expect(sidebar).toHaveAttribute("data-open", "true");
  });

  it("does not trigger open when swipe distance is 50px or less", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    touchStart(shell, 18, 100);
    touchMove(shell, 68, 102);
    touchEnd(shell, 68, 102);

    expect(sidebar).toHaveAttribute("data-open", "false");
  });

  it("updates sidebar transform while dragging so animation follows the finger", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    touchStart(shell, 20, 100);
    touchMove(shell, 160, 105);

    expect(sidebar).toHaveAttribute("data-dragging", "true");
    expect(sidebar).toHaveStyle({ transform: "translateX(-140px)" });
  });

  it("snaps open only when released past 50% and snaps back otherwise", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    touchStart(shell, 20, 110);
    touchMove(shell, 120, 114);
    touchEnd(shell, 120, 114);
    expect(sidebar).toHaveAttribute("data-open", "false");

    touchStart(shell, 20, 110);
    touchMove(shell, 220, 114);
    touchEnd(shell, 220, 114);
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 180, 110);
    touchMove(shell, 130, 114);
    touchEnd(shell, 130, 114);
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 180, 110);
    touchMove(shell, 20, 114);
    touchEnd(shell, 20, 114);
    expect(sidebar).toHaveAttribute("data-open", "false");
  });

  it("ignores vertical swipes to avoid conflicting with scroll gestures", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    touchStart(shell, 20, 100);
    touchMove(shell, 30, 240);
    touchEnd(shell, 30, 240);

    expect(sidebar).toHaveAttribute("data-open", "false");
  });

  it("does not close sidebar on vertical swipe when already open", () => {
    render(<AppShell>Content</AppShell>);

    const shell = screen.getByTestId("app-shell");
    const sidebar = screen.getByLabelText("Workspace sidebar");

    fireEvent.click(screen.getByRole("button", { name: "Open sidebar menu" }));
    expect(sidebar).toHaveAttribute("data-open", "true");

    touchStart(shell, 180, 120);
    touchMove(shell, 170, 280);
    touchEnd(shell, 170, 280);

    expect(sidebar).toHaveAttribute("data-open", "true");
  });
});
