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
        background: "#F8FAFC",
        foreground: "#000000",
        navy: {
          DEFAULT: "#0F172A",
          dark: "#0B132B",
          light: "#1E293B",
          deep: "#0A192F",
        },
        brandBlue: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#3B82F6",
        },
        skyBlue: {
          DEFAULT: "#38BDF8",
          dark: "#0284C7",
          light: "#E0F2FE",
          accent: "#0EA5E9",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          soft: "#E0F2FE",
        },
        success: {
          DEFAULT: "#059669",
          soft: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#D97706",
          soft: "#FFFBEB",
        },
        error: {
          DEFAULT: "#DC2626",
          soft: "#FEF2F2",
        },
        info: {
          DEFAULT: "#0284C7",
          soft: "#E0F2FE",
        },
      },
      boxShadow: {
        none: "none",
        "home-neu": "8px 8px 18px rgba(15, 23, 42, 0.08), -8px -8px 18px rgba(255, 255, 255, 0.9)",
        "home-neu-sm": "4px 4px 10px rgba(15, 23, 42, 0.06), -4px -4px 10px rgba(255, 255, 255, 0.9)",
        "home-neu-inset": "inset 4px 4px 8px rgba(15, 23, 42, 0.07), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
        "home-neu-btn": "4px 4px 10px rgba(37, 99, 235, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.8)",
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
