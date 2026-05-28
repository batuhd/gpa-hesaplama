/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#354b5f',
          blue: '#0056b3',
          light: '#f8f9fa',
          border: '#dee2e6',
          hover: '#e8f0fe',
        }
      }
    },
  },
  plugins: [],
}
