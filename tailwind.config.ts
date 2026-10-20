import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1A2D5E",
        gold: "#F0B429",
        ice: "#F5FAFF",
      },
      fontFamily: {
        display: ["Rubik", "sans-serif"],
        body: ["Source Sans 3", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(60, 104, 158, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
