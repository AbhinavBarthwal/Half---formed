/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-deep': '#1B2420',
        'parchment': '#EDE6D3',
        'ash': '#8B9490',
        'sage-signal': '#7C9B7E',
        'clay-thread': '#C17F56',
        'dusk-lavender': '#9C8CA8',
        'harbor-teal': '#4F8583',
        'philosophy-gold': '#B8A46E'
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Karla', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
