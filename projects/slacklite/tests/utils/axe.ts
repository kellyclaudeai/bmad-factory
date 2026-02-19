import axeCore, { type RunOptions } from "axe-core";

const AXE_OPTIONS: RunOptions = {
  rules: {
    // jsdom does not implement layout APIs required for color contrast checks.
    "color-contrast": { enabled: false },
  },
};

export async function runAxe(container: Element | Document) {
  return axeCore.run(container, AXE_OPTIONS);
}
