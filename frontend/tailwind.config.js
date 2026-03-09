/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        primary: '#414BEA',
        secondary: '#F05537',
        accent: '#7752FE',
        error: '#F05537',
        text: {
          main: 'rgb(var(--color-text-main) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        brand: {
          50: '#F8EDFF',
          100: '#F6F5F5',
          200: '#DDF2FD',
          300: '#D9E2FF',
          400: '#C2D9FF',
          500: '#414BEA',
          600: '#525CEB',
          700: '#190482',
          800: '#222222',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Open Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'spaceship', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
