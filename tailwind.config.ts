import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080A0F"
        },
        graphite: {
          950: "#111827",
          900: "#171F2E",
          800: "#253044"
        },
        surface: {
          100: "#F6F2EA"
        },
        paper: {
          50: "#FFFDF8"
        },
        gold: {
          500: "#C6A15B",
          400: "#D8BA75",
          300: "#E8D49B"
        },
        intelligence: {
          500: "#4F7CFF",
          400: "#789BFF",
          100: "#EAF0FF"
        },
        muted: {
          500: "#7A7F8A"
        },
        legal: {
          border: "#E4DED2"
        },
        matte: {
          950: "#080A0F",
          900: "#111827",
          850: "#171b21",
          800: "#1e232b"
        },
        steel: {
          300: "#b9c0ca",
          200: "#d6dbe2"
        },
        brass: {
          400: "#c8a96a",
          300: "#ddc38b"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)",
        paper: "0 24px 80px rgba(8, 10, 15, 0.14)",
        ai: "0 24px 80px rgba(79, 124, 255, 0.14)",
        blue: "0 0 28px rgba(79, 124, 255, 0.55)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
