import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(220,38,38,0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(220,38,38,0.8)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
