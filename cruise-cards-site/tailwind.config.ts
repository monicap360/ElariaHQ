import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0E2A3A",
        harbor: "#2F6F8F",
        seaglass: "#3FA9A3",
        "accent-teal": "#3FA9A3",
        driftwood: "#6E7C87",
        ocean: "#2F6F8F",
        teal: "#3FA9A3",
        sand: "#F4EFEA",
        cloud: "#FFFFFF",
        slate: "#6E7C87",
        success: "#2E8B57",
        warning: "#C98A2C",
      },
      fontFamily: {
        heading: ['"Libre Baskerville"', "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
} satisfies Config;
