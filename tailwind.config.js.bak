import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          neon: "#00FF41" /* The matrix/terminal green */,
          "neon-glow": "rgba(0, 255, 65, 0.15)",
          "dark-bg": "#0d1117" /* Dark Mode Background */,
          "dark-card": "#161b22" /* Dark Mode Card */,
          "light-bg": "#f0f2f5" /* Light Mode Background */,
          "light-card": "#ffffff" /* Light Mode Card */,
        },
        syntax: {
          comment: "#8b949e",
          keyword: "#ff7b72",
          string: "#a5d6ff",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      boxShadow: {
        "neon-sm": "0 0 10px rgba(0, 255, 65, 0.2)",
        "neon-strong": "0 0 20px rgba(0, 255, 65, 0.4)",
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
