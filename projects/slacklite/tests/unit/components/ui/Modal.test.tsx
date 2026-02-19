import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "@/components/ui/Modal";
import { runAxe } from "@/tests/utils/axe";

describe("Modal", () => {
  it("renders an overlay when open", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose} title="Modal title">
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Modal title" })).toBeInTheDocument();
    expect(
      container.querySelector(".absolute.inset-0.bg-gray-900.bg-opacity-50"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("closes on ESC key press", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Modal title">
        <p>Modal content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("traps focus and cycles on Tab / Shift+Tab", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Modal title">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    const lastFocusableButton = screen.getByRole("button", { name: "Second action" });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    lastFocusableButton.focus();
    fireEvent.keyDown(lastFocusableButton, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(lastFocusableButton).toHaveFocus();
  });

  it("has no detectable accessibility violations", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose} title="Accessible modal">
        <button type="button">Primary action</button>
      </Modal>,
    );
    const results = await runAxe(container);

    expect(results.violations).toHaveLength(0);
  });
});
