/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#0E0F0A",
        surface: "#16170F",
        ink: "#F0EFE8",
        muted: "#9A9A8E",
        line: "rgba(240,239,232,0.08)",
        // Warm ember/amber accent system (replaces the old green "leaf").
        amber: {
          DEFAULT: "#F5A524", // primary accent: buttons, savings %, active states, links
          bright: "#FFB84D", // hover / emphasis
          soft: "rgba(245,165,36,0.12)", // tinted backgrounds
        },
        ember: "#F2682C", // secondary: gradients, warning state, particles
        spark: "#D9342B", // deep accent dots
        hot: "#FFE9C7", // hot highlight
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
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
