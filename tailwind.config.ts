import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#08070f",
        panel: "#0e0c22",
        "panel-2": "#141133",
        line: "#251f4d",
        indigo: "#3c3b74",
        violet: "#7c5cff",
        lilac: "#b9aef7",
        paper: "#ecebf7",
        dim: "#8f89b6",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        freq: ["var(--font-dmmono)", "monospace"],
      },
      maxWidth: { content: "1180px" },
    },
  },
  plugins: [],
};
export default config;
