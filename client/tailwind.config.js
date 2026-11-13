/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: "#FBFBF9",
          card: "#FFFFFF",
          navy: "#0F172A",
          muted: "#475569",
          border: "#E2E8F0",
          accent: "#0D9488", // warm teal
          accentHover: "#0F766E",
          accentLight: "#F0FDFA",
          blue: "#0284C7",
          blueLight: "#F0F9FF",
          amber: "#D97706",
          amberLight: "#FFFBEB",
          rose: "#E11D48",
          roseLight: "#FFF1F2",
          emerald: "#059669",
          emeraldLight: "#ECFDF5",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        dropdown: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      }
    },
  },
  plugins: [],
}
