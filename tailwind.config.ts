import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        ink: "var(--color-text)",
        sub: "var(--color-text-sub)",
        line: "var(--color-border)",
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
          2: "var(--color-accent-2)",
        },
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
        "gradient-brand-hover": "var(--gradient-brand-hover)",
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      boxShadow: {
        airbnb: "0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)",
        airbnbLg: "0 6px 20px rgba(0,0,0,.1)",
      },
      fontFamily: {
        sans: [
          "Circular",
          "Inter",
          "Helvetica Neue",
          "Hiragino Sans",
          "ヒラギノ角ゴシック",
          "Noto Sans JP",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
