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
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        foreground: "var(--primary-text)",
        "secondary-text": "var(--secondary-text)",
        "muted-text": "var(--muted-text)",
        primary: {
          DEFAULT: "var(--primary-brand)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        error: {
          DEFAULT: "var(--error)",
          soft: "var(--error-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },
        neutral: {
          DEFAULT: "var(--neutral)",
        },
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
