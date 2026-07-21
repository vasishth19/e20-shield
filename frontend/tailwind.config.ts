import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#050507",
        panel: "#0F0F13",
        panel2: "#151519",
        border: "#26262E",
        warn: "#FB923C",
        safe: "#34D399",
        danger: "#F87171",
        accent: "#818CF8",
        accent2: "#22D3EE",
        gold: "#FBBF24",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, #050507), linear-gradient(90deg, rgba(129,140,248,0.08) 1px, transparent 1px), linear-gradient(rgba(129,140,248,0.08) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(129,140,248,0.25) 0%, rgba(34,211,238,0.08) 45%, transparent 80%)",
        "card-glow":
          "linear-gradient(135deg, rgba(129,140,248,0.15), rgba(34,211,238,0.05))",
      },
      boxShadow: {
        glow: "0 0 40px rgba(129,140,248,0.25)",
        "glow-cyan": "0 0 40px rgba(34,211,238,0.2)",
        "glow-green": "0 0 30px rgba(52,211,153,0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseglow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        drift: {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(-40px,-40px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseglow: "pulseglow 3s ease-in-out infinite",
        drift: "drift 20s linear infinite alternate",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
