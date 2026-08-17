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
        "neu-flat": "8px 8px 18px rgba(74, 74, 74, 0.15), -8px -8px 18px rgba(255, 255, 227, 0.95)",
        "neu-flat-sm": "4px 4px 10px rgba(74, 74, 74, 0.14), -4px -4px 10px rgba(255, 255, 227, 0.9)",
        "neu-flat-lg": "12px 12px 24px rgba(74, 74, 74, 0.18), -12px -12px 24px rgba(255, 255, 227, 1)",
        "neu-inset": "inset 4px 4px 8px rgba(74, 74, 74, 0.14), inset -4px -4px 8px rgba(255, 255, 227, 0.9)",
        "neu-inset-sm": "inset 2px 2px 5px rgba(74, 74, 74, 0.12), inset -2px -2px 5px rgba(255, 255, 227, 0.85)",
        "neu-btn": "4px 4px 10px rgba(74, 74, 74, 0.15), -4px -4px 10px rgba(255, 255, 227, 0.9)",
        "neu-btn-accent": "5px 5px 14px rgba(74, 74, 74, 0.22), -5px -5px 14px rgba(255, 255, 227, 0.85), 0 0 12px rgba(109, 129, 150, 0.3)",
        "neu-pressed": "inset 3px 3px 6px rgba(74, 74, 74, 0.18), inset -3px -3px 6px rgba(255, 255, 227, 0.9)",
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
