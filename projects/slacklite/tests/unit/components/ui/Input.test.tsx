import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders a label linked to the input id", () => {
    render(<Input id="email" label="Email address" />);

    expect(screen.getByLabelText("Email address")).toHaveAttribute("id", "email");
  });

  it("renders helper text and helper aria-describedby when there is no error", () => {
    render(<Input id="display-name" helperText="Visible to teammates" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveAttribute("aria-describedby", "display-name-helper");
    expect(screen.getByText("Visible to teammates")).toHaveAttribute(
      "id",
      "display-name-helper",
    );
  });

  it("renders error text, error styles, and error aria-describedby", () => {
    render(
      <Input
        id="channel-name"
        error="Channel name is required."
        helperText="helper should be hidden"
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "channel-name-error");
    expect(input).toHaveClass("border-error");
    expect(screen.getByText("Channel name is required.")).toHaveAttribute(
      "id",
      "channel-name-error",
    );
    expect(screen.queryByText("helper should be hidden")).not.toBeInTheDocument();
  });

  it("does not set aria-describedby when neither helperText nor error is provided", () => {
    render(<Input id="plain-input" />);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });

  it("calls onChange when the value changes", () => {
    const onChange = vi.fn();

    render(<Input id="workspace" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Acme" } });

    expect(onChange).toHaveBeenCalledOnce();
  });

  it("forwards refs to the input element", () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input id="with-ref" ref={ref} />);

    expect(ref.current).toBe(screen.getByRole("textbox"));
  });
});
