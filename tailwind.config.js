/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#0E0F0A",
        surface: "#161710",
        ink: "#F0EFE8",
        muted: "#7A7A6E",
        line: "#252620",
        leaf: {
          DEFAULT: "#16A34A",
          bright: "#22C55E",
          soft: "#0D2B17",
        },
        amber: {
          DEFAULT: "#C2772E",
          soft: "#2B1A0A",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Syne"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,22,15,0.04), 0 12px 28px -12px rgba(21,22,15,0.12)",
        lift: "0 2px 4px rgba(21,22,15,0.05), 0 24px 48px -16px rgba(21,22,15,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
