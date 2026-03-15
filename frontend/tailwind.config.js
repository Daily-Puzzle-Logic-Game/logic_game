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
        primary: '#4F46E5', // Deep Indigo
        secondary: '#9333EA', // Electric Purple
        cyan: '#22D3EE', // Neon Cyan
        gold: '#FACC15', // Game Gold
        orange: '#FB923C', // Game Orange
        accent: '#7752FE',
        error: '#F05537',
        text: {
          main: 'rgb(var(--color-text-main) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
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
        'float': 'float 20s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translate(0, 0)', opacity: '0' },
          '25%': { opacity: '0.4' },
          '50%': { transform: 'translate(100px, -100px)', opacity: '0.7' },
          '75%': { opacity: '0.4' },
          '100%': { transform: 'translate(200px, -200px)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'brightness(1) shadow(0 0 5px rgba(250, 204, 21, 0.5))' },
          '50%': { filter: 'brightness(1.5) shadow(0 0 20px rgba(250, 204, 21, 0.8))' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
