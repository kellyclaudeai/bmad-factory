import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function ExampleComponent() {
  return <h1>Hello from Vitest</h1>;
}

describe("ExampleComponent", () => {
  it("renders heading text", () => {
    render(<ExampleComponent />);

    expect(
      screen.getByRole("heading", { name: "Hello from Vitest" }),
    ).toBeInTheDocument();
  });
});
