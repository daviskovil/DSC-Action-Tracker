import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff0f0",
          100: "#ffdddd",
          200: "#ffc0c0",
          300: "#ff9494",
          400: "#ff5757",
          500: "#ff2323",
          600: "#E30613", // DataSkate red
          700: "#c00010",
          800: "#a00010",
          900: "#840010",
          950: "#490007",
        },
        bucket1: "#6366f1",  // indigo - AE Engagement
        bucket2: "#0ea5e9",  // sky   - Client Outreach
        bucket3: "#10b981",  // emerald - Content & Assets
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
