/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A",
          dark: "#15803d",
          light: "#dcfce7",
        },
        secondary: {
          DEFAULT: "#2563EB",
          dark: "#1d4ed8",
          light: "#dbeafe",
        },
        warning: {
          DEFAULT: "#F59E0B",
          dark: "#d97706",
          light: "#fef3c7",
        },
        danger: {
          DEFAULT: "#EF4444",
          dark: "#dc2626",
          light: "#fee2e2",
        },
        slatebg: {
          DEFAULT: "#F8FAFC",
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans Devanagari"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
