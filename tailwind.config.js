/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark palette
        navy: {
          900: '#0d1b2a',
          800: '#1b263b',
          700: '#415a77',
          400: '#778da9',
          100: '#e0e1dd',
        },
        // Light palette
        crimson: {
          900: '#780000',
          700: '#c1121f',
          100: '#fdf0d5',
          800: '#003049',
          400: '#669bbc',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        serif: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Georgia', 'serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
