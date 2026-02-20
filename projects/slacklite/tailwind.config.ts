import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: {
          1: "var(--color-surface-1)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
          4: "var(--color-surface-4)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          subtle: "var(--color-accent-subtle)",
          dim: "var(--color-accent-dim)",
        },
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        disabled: "var(--color-text-disabled)",
        inverse: "var(--color-text-inverse)",
        error: {
          DEFAULT: "var(--color-error)",
          subtle: "var(--color-error-subtle)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          subtle: "var(--color-warning-subtle)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          subtle: "var(--color-info-subtle)",
        },
        online: "var(--color-online)",
        offline: "var(--color-offline)",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12/16
        sm: ["0.8125rem", { lineHeight: "1.125rem" }], // 13/18
        base: ["0.875rem", { lineHeight: "1.25rem" }], // 14/20
        lg: ["1rem", { lineHeight: "1.5rem" }], // 16/24
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20/28
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24/32
        "3xl": ["2rem", { lineHeight: "2.5rem" }], // 32/40
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
