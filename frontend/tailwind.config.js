/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FDF0D5',
        surface: '#FFFFFF',
        raised: '#FDF0D5',
        edge: '#669BBC',
        ink: '#003049',
        mute: '#669BBC',
        healthy: '#4A7C59',
        critical: '#C1121F',
        warning: '#D67D00',
        action: '#003049',
        severe: '#780000',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 0 0 1px #669BBC, 0 12px 32px -12px rgba(0, 48, 73, 0.2)',
      },
    },
  },
  plugins: [],
}
