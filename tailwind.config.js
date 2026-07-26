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
        // Linked to CSS variables in src/colors.css
        navy: {
          950: 'var(--color-navy-950)',
          900: 'var(--color-navy-900)',
          800: 'var(--color-navy-800)',
          700: 'var(--color-navy-700)',
          400: 'var(--color-navy-400)',
          300: 'var(--color-navy-300)',
          200: 'var(--color-navy-200)',
          100: 'var(--color-navy-100)',
        },
        crimson: {
          950: 'var(--color-crimson-950)',
          900: 'var(--color-crimson-900)',
          800: 'var(--color-crimson-800)',
          700: 'var(--color-crimson-700)',
          600: 'var(--color-crimson-600)',
          400: 'var(--color-crimson-400)',
          200: 'var(--color-crimson-200)',
          100: 'var(--color-crimson-100)',
        },
        cream: {
          900: 'var(--color-cream-900)',
          800: 'var(--color-cream-800)',
          700: 'var(--color-cream-700)',
          400: 'var(--color-cream-400)',
          200: 'var(--color-cream-200)',
          100: 'var(--color-cream-100)',
          50:  'var(--color-cream-50)',
        },
        slateContrast: {
          900: 'var(--color-slate-900)',
          800: 'var(--color-slate-800)',
          700: 'var(--color-slate-700)',
          600: 'var(--color-slate-600)',
          500: 'var(--color-slate-500)',
          400: 'var(--color-slate-400)',
          300: 'var(--color-slate-300)',
          200: 'var(--color-slate-200)',
          100: 'var(--color-slate-100)',
          50:  'var(--color-slate-50)',
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
