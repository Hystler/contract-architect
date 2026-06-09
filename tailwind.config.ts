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
        matte: {
          950: "#0d0f12",
          900: "#12151a",
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
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
