/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080f09',
        surface: '#0d1a10',
        border:  '#1a2e1d',
        text:    '#ede8df',
        accent:  '#c9b99a',
        muted:   '#6b8f72',
        active:  '#2d5a34',
      },
      fontFamily: {
        display: ['EB Garamond', 'serif'],
        body:    ['Space Grotesk', 'sans-serif'],
        mono:    ['Courier Prime', 'monospace'],
      },
    },
  },
  plugins: [],
}
