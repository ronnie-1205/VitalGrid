/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        surface: '#121821',
        raised: '#1A222D',
        edge: '#232C38',
        ink: '#E8EDF2',
        mute: '#8A97A5',
        healthy: '#34C77B',
        critical: '#E5484D',
        warning: '#E8A33D',
        action: '#4C9FE8',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 0 0 1px #232C38, 0 12px 32px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
