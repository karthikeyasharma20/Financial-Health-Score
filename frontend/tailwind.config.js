/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Supports dark and light toggles
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F80ED',
          purple: '#7F00FF',
          indigo: '#4F46E5',
          navy: '#0F172A',
          dark: '#030712'
        },
        slate: {
          850: '#1E293B',
          950: '#030712'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)'
      }
    },
  },
  plugins: [],
}
