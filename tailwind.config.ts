import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF9EC",
        honey: {
          50: "#FFF8E1",
          100: "#FFEFB8",
          200: "#FFE287",
          300: "#FFD45A",
          400: "#FFC93C",
          500: "#F5B014",
          600: "#D48F00",
        },
        leaf: {
          50: "#EAF8EF",
          100: "#CDEFD9",
          200: "#9FDFB6",
          300: "#6CCB8F",
          400: "#3FB46C",
          500: "#2F9E5B",
          600: "#237D47",
          700: "#1B5E37",
          800: "#143F27",
          900: "#0D2A1A",
        },
        petal: {
          100: "#FFE3EC",
          300: "#FF9EBB",
          400: "#FF7AA2",
          500: "#F2548A",
        },
        sky: {
          100: "#DDF1FF",
          300: "#8CCBFF",
          500: "#3C9BEA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(20, 63, 39, 0.18)",
        pop: "0 4px 0 0 rgba(20, 63, 39, 0.9)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(-4deg)" },
          "50%": { transform: "translateY(-10px) rotate(4deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-12deg)" },
          "75%": { transform: "rotate(12deg)" },
        },
        pollen: {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "1" },
          "100%": {
            transform: "translate(var(--dx), var(--dy)) scale(0.2)",
            opacity: "0",
          },
        },
        flyaway: {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translate(60px, -70px) rotate(25deg)",
            opacity: "0",
          },
        },
        popin: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        grow: {
          "0%": { transform: "scaleY(0.2)", opacity: "0" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        pollen: "pollen 0.8s ease-out forwards",
        flyaway: "flyaway 0.9s ease-in forwards",
        popin: "popin 0.35s ease-out",
        grow: "grow 0.6s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
