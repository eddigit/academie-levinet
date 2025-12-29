/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B1120',
        paper: '#111827',
        subtle: '#1F2937',
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F97316',
          glow: 'rgba(249, 115, 22, 0.5)',
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        border: {
          DEFAULT: '#374151',
          active: '#3B82F6',
        },
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 15px rgba(59, 130, 246, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};