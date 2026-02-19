import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#4A154B",
        "primary-brand": "#4A154B",
        "primary-light": "#611F69",
        "primary-dark": "#350D36",
        success: "#2EB67D",
        error: "#E01E5A",
        warning: "#ECB22E",
        info: "#36C5F0",
        white: "#FFFFFF",
        gray: {
          900: "#1D1C1D",
          800: "#2C2B2C",
          700: "#616061",
          600: "#868686",
          500: "#A0A0A0",
          400: "#D1D1D1",
          300: "#E8E8E8",
          200: "#F2F2F2",
          100: "#F8F8F8",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
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
} satisfies Config;
