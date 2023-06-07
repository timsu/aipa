/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        left: "-2px 0 5px rgba(0, 0, 0, 0.1)",
      },
      gridTemplateColumns: {
        "1x2": "1fr 2fr",
      },
      colors: {
        brand: {
          50: "#f3f7f8",
          100: "#dfeaee",
          200: "#c3d7de",
          300: "#9abac6",
          400: "#6a96a8",
          500: "#4d798d",
          600: "#436577",
          700: "#3b5463",
          800: "#364854",
          900: "#313e48",
          950: "#1d272f",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
