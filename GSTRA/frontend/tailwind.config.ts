import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        maroon: "#7B1C1C",
        ember: "#AA3A2A",
        parchment: "#F9F1E7",
        coal: "#2A1616"
      },
      boxShadow: {
        warm: "0 8px 30px rgba(123, 28, 28, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
