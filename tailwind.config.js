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
        speede: {
          red: '#DC2626',
          yellow: '#FFD166',
          blue: '#118AB2',
          green: '#06D6A0',
          black: '#111111',
          white: '#ffffff',
          gray: '#E0E0E0',
          darkGray: '#1A1A1A',
        },
        theme: {
          bg: 'var(--theme-bg)',
          surface: 'var(--theme-surface)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-text-muted)',
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          border: 'var(--theme-border-color)'
        }
      }
    },
      fontFamily: {
        sans: ['Fredoka', 'sans-serif'],
        display: ['"Luckiest Guy"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'cartoon': '4px 4px 0px rgba(17, 17, 17, 1)',
        'cartoon-hover': '6px 6px 0px rgba(17, 17, 17, 1)',
        'cartoon-active': '0px 0px 0px rgba(17, 17, 17, 1)',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'spin-slow': 'spin 4s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.95' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.9' },
        }
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
  },
  plugins: [],
}
