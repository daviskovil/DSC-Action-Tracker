import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bucket1: "#6366f1", // indigo - AE Engagement
        bucket2: "#0ea5e9", // sky  - Client Outreach
        bucket3: "#10b981", // emerald - Content & Assets
      },
    },
  },
  plugins: [],
};

export default config;
