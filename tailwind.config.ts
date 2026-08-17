import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-warm": "var(--surface-warm)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        foreground: "var(--primary-text)",
        "secondary-text": "var(--secondary-text)",
        "muted-text": "var(--muted-text)",
        charcoal: {
          DEFAULT: "#4A4A4A",
          dark: "#333333",
          light: "#606060",
        },
        silver: {
          DEFAULT: "#CBCBCB",
          dark: "#A8A8A8",
          light: "#E2E2E2",
        },
        cream: {
          DEFAULT: "#FFFFE3",
          dark: "#F0F0D0",
          light: "#FFFFF2",
        },
        slateBlue: {
          DEFAULT: "#6D8196",
          dark: "#576A7E",
          light: "#879BB0",
        },
        primary: {
          DEFAULT: "#6D8196",
          hover: "#576A7E",
          soft: "#FFFFE3",
        },
        success: {
          DEFAULT: "#047857",
          soft: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#B45309",
          soft: "#FFFBEB",
        },
        error: {
          DEFAULT: "#B91C1C",
          soft: "#FEF2F2",
        },
        info: {
          DEFAULT: "#6D8196",
          soft: "#FFFFE3",
        },
        neutral: {
          DEFAULT: "#4A4A4A",
        },
      },
      boxShadow: {
        none: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
