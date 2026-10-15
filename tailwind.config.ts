import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          sky: "#38bdf8",
          grass: "#22c55e",
          earth: "#78350f",
          gold: "#fbbf24",
          goldGlow: "#fef08a",
          amber: "#f59e0b",
          castle: "#6366f1",
          fantasyPink: "#ec4899",
          fantasyPurple: "#a855f7",
          darkNavy: "#0f172a",
        },
      },
      animation: {
        "float-slow": "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 1.5s ease-in-out infinite",
        "coin-spin": "coinSpin 1.2s steps(8) infinite",
        "sparkle": "sparkle 1.8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(251, 191, 36, 0.7))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 5px rgba(251, 191, 36, 0.3))" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        sparkle: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: "0.8" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
