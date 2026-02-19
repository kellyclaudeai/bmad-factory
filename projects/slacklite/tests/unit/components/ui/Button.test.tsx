import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/Button";
import { runAxe } from "@/tests/utils/axe";

describe("Button", () => {
  it("uses the primary variant by default", () => {
    render(<Button>Send</Button>);

    expect(screen.getByRole("button", { name: "Send" })).toHaveClass(
      "bg-primary-brand",
      "text-white",
    );
  });

  it.each([
    { expectedClass: "border-gray-600", variant: "secondary" as const },
    { expectedClass: "bg-error", variant: "destructive" as const },
  ])("applies the $variant variant styles", ({ expectedClass, variant }) => {
    render(<Button variant={variant}>Action</Button>);

    expect(screen.getByRole("button", { name: "Action" })).toHaveClass(
      expectedClass,
    );
  });

  it.each([
    { expectedClass: "px-3", size: "sm" as const },
    { expectedClass: "px-4", size: "md" as const },
    { expectedClass: "px-6", size: "lg" as const },
  ])("applies the $size size styles", ({ expectedClass, size }) => {
    render(<Button size={size}>Sized</Button>);

    expect(screen.getByRole("button", { name: "Sized" })).toHaveClass(
      expectedClass,
    );
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click me" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("respects the disabled state", () => {
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));

    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards refs to the button element", () => {
    const ref = createRef<HTMLButtonElement>();

    render(<Button ref={ref}>Ref button</Button>);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Ref button" }));
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await runAxe(container);

    expect(results.violations).toHaveLength(0);
  });
});
