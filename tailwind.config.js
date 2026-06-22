/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F5EF",
        surface: "#FFFFFF",
        ink: "#15160F",
        muted: "#6E6E64",
        line: "#E6E4DA",
        leaf: {
          DEFAULT: "#16A34A",
          bright: "#22C55E",
          soft: "#E7F6EC",
        },
        amber: {
          DEFAULT: "#C2772E",
          soft: "#F7EEDF",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['Inter', "system-ui", "sans-serif"],
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
