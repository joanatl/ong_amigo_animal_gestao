import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#e879f9',
          400: '#c026d3',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle:  '#fafafa',
          muted:   '#f4f4f5',
        },
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / .10), 0 2px 8px -2px rgb(0 0 0 / .06)',
        'brand-sm':   '0 2px 8px -1px rgb(147 51 234 / .25)',
        'brand-md':   '0 6px 20px -3px rgb(147 51 234 / .35)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up':  'fade-up .25s ease-out both',
        'scale-in': 'scale-in .15s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
