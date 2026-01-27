import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2A3D",
        ocean: "#0F5E7A",
        teal: "#1FA6A0",
        sand: "#F4F7F6",
        cloud: "#FFFFFF",
        slate: "#5F6E78",
        success: "#2E8B57",
        warning: "#C98A2C",
      },
    },
  },
} satisfies Config;
