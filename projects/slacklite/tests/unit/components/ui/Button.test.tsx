import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders the default primary variant and medium size", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });

    expect(button).toHaveClass("bg-primary-brand");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("px-4");
    expect(button).toHaveClass("py-2");
  });

  it("renders secondary and destructive variants", () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    const secondaryButton = screen.getByRole("button", { name: "Secondary" });

    expect(secondaryButton).toHaveClass("border");
    expect(secondaryButton).toHaveClass("text-gray-700");

    rerender(<Button variant="destructive">Delete</Button>);
    const destructiveButton = screen.getByRole("button", { name: "Delete" });

    expect(destructiveButton).toHaveClass("bg-error");
    expect(destructiveButton).toHaveClass("text-white");
  });

  it("supports size variants", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button", { name: "Large" });

    expect(button).toHaveClass("px-6");
    expect(button).toHaveClass("py-3");
    expect(button).toHaveClass("text-lg");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });

    expect(button).toBeDisabled();
  });
});
