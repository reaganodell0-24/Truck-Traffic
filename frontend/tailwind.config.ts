import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e17",
          secondary: "#111827",
          card: "#1a2234",
          "card-hover": "#1e2a40",
        },
        border: "#1e293b",
        aurora: "#00d4aa",
        kodiak: "#f59e0b",
        gatik: "#8b5cf6",
        waabi: "#ef4444",
        "bot-auto": "#3b82f6",
        ev: "#06b6d4",
      },
      fontFamily: {
        mono: ["Space Mono", "monospace"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
