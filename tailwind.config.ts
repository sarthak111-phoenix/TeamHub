import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0A0908",
          surface: "#12100E",
          card: "#181512",
          border: "#2E261F",
          hover: "#3A3027",
          muted: "#A1988E",
        },
        metallic: {
          gold: "#F59E0B",
          ember: "#EA580C",
          flame: "#EF4444",
          steel: "#F59E0B",
          chrome: "#FBBF24",
          cyan: "#F97316",
          bronze: "#D97706",
          accent: "#F59E0B",
        },
      },
      backgroundImage: {
        "metallic-gradient":
          "linear-gradient(135deg, rgba(46,38,31,0.9) 0%, rgba(18,16,14,0.95) 100%)",
        "metallic-button":
          "linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #D97706 100%)",
        "metallic-button-hover":
          "linear-gradient(135deg, #FBBF24 0%, #F97316 50%, #EA580C 100%)",
        "metallic-border":
          "linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(234,88,12,0.3) 50%, rgba(46,38,31,0.8) 100%)",
        "phoenix-glow":
          "radial-gradient(circle at center, rgba(245,158,11,0.18) 0%, rgba(234,88,12,0.08) 45%, transparent 70%)",
      },
      boxShadow: {
        "metallic-glow": "0 0 25px -4px rgba(245,158,11,0.45), 0 0 12px -2px rgba(234,88,12,0.3)",
        "card-sheen": "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

