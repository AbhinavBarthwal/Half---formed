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
        // High contrast Dark Palette (#0d1b2a, #1b263b, #415a77, #778da9, #e0e1dd)
        navy: {
          950: '#060d14',
          900: '#0d1b2a',
          800: '#1b263b',
          700: '#415a77',
          400: '#778da9',
          300: '#a3b1c6',
          200: '#c5d1e0',
          100: '#f0f4f8',
        },
        // High contrast Light Palette (#780000, #c1121f, #fdf0d5, #003049, #669bbc)
        crimson: {
          950: '#450000',
          900: '#780000',
          800: '#900c15',
          700: '#c1121f',
          600: '#d91f2c',
          400: '#e63946',
          200: '#f8adab',
          100: '#fdf0d5',
        },
        cream: {
          900: '#2c2211',
          800: '#4a3b22',
          700: '#755c36',
          400: '#b89a6c',
          200: '#eedcb8',
          100: '#fdf0d5',
          50:  '#fff9ee',
        },
        slateContrast: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50:  '#f8fafc',
        }
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
