/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shaft: '#0f172a',
        floorBorder: '#334155',
        carBody: '#1e293b',
        carActive: '#e11d48',
        doorPanel: '#475569',
      }
    },
  },
  plugins: [],
}
