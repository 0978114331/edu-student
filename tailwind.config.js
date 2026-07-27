/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ec9ff',
          400: '#59abff',
          500: '#3389fc',
          600: '#1c6af2',
          700: '#1554e0',
          800: '#1845b6',
          900: '#1a3e8f',
          950: '#142757',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a6f4d0',
          300: '#6ee9b0',
          400: '#34d394',
          500: '#16b97f',
          600: '#0a9766',
          700: '#087853',
          800: '#0a5f44',
          900: '#0a4d39',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.12)',
        soft: '0 4px 24px rgba(0,0,0,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
