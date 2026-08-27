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
        accent: {
          50: "#f0f4f8",
          100: "#d9e4ef",
          200: "#b8cde0",
          300: "#8bafc9",
          400: "#6b93b3",
          500: "#5a7fa0",
          600: "#4a6d8c",
          700: "#3d5a73",
        },
        charcoal: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d9d9de",
          300: "#b8b8c0",
          400: "#91919d",
          500: "#737382",
          600: "#5d5d6a",
          700: "#4c4c56",
          800: "#414149",
          900: "#2d2d33",
          950: "#1a1a1f",
        },
        warm: {
          50: "#faf8f5",
          100: "#f5f0ea",
          200: "#ece4d9",
          300: "#ddd0be",
          400: "#c9b49a",
          500: "#b89d7e",
          600: "#a68a6a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        128: "32rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 30px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 40px rgba(0, 0, 0, 0.08)",
        "soft-xl": "0 12px 50px rgba(0, 0, 0, 0.1)",
        glow: "0 0 40px rgba(90, 127, 160, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
