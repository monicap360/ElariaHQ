import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2D4D",
        ocean: "#0EA5E9",
        teal: "#14B8A6",
        sand: "#F8FAFC",
        cloud: "#FFFFFF",
        slate: "#64748B",
        success: "#2E8B57",
        warning: "#C98A2C",
      },
    },
  },
} satisfies Config;
