/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      transitionDuration: {
        '600': '600ms',
      },
      scale: {
        '98': '.98',
      },
      colors: {
        dark: {
          DEFAULT: '#1A2D42',
          50: '#1f3754',
          100: '#243f61',
          200: '#2a476e',
          300: '#2f4f7b',
          400: '#355788',
          500: '#3a5f95',
          600: '#4067a2',
          700: '#456faf',
          800: '#4b77bc',
          900: '#507fc9',
        },
        darkSecondary: '#2E4156',
        darkText: {
          primary: '#D4D8DD',
          secondary: '#AAB7B7',
        },
        darkBorder: '#C8D0DA',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'progress': 'progress 2.5s ease-in-out forwards',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
};