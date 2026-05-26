/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#0f3d91",
        brandRed: "#d9363e",
        brandGreen: "#4f8a10"
      }
    }
  },
  plugins: []
};
