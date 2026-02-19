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
        "primary-brand": "#4A154B",
        "primary-light": "#611F69",
        "primary-dark": "#350D36",
        success: "#2EB67D",
        error: "#E01E5A",
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
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        12: "48px",
      },
    },
  },
  plugins: [],
} satisfies Config;
