import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders an associated label", () => {
    render(<Input id="workspace-name" label="Workspace Name" />);

    const input = screen.getByLabelText("Workspace Name");
    expect(input).toHaveAttribute("id", "workspace-name");
  });

  it("renders helper text and points aria-describedby to helper id", () => {
    render(
      <Input id="email" label="Email" helperText="Use your work email address." />,
    );

    const input = screen.getByLabelText("Email");

    expect(screen.getByText("Use your work email address.")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveAttribute("aria-describedby", "email-helper");
  });

  it("renders error text and uses error accessibility attributes", () => {
    render(
      <Input
        id="channel-name"
        label="Channel Name"
        helperText="Lowercase and hyphens only."
        error="Channel name is required."
      />,
    );

    const input = screen.getByLabelText("Channel Name");

    expect(screen.getByText("Channel name is required.")).toBeInTheDocument();
    expect(
      screen.queryByText("Lowercase and hyphens only."),
    ).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "channel-name-error");
    expect(input).toHaveClass("border-error");
  });

  it("respects disabled state", () => {
    render(<Input id="disabled-input" label="Disabled" disabled />);

    expect(screen.getByLabelText("Disabled")).toBeDisabled();
  });
});
