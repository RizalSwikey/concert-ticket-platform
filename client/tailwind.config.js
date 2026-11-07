/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#000000',
          surface: '#09090b',
          card: '#111115',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        bone: '#ffffff',
        ash: '#9a9a9a',
        silver: '#bdbdbd',
        iris: {
          DEFAULT: '#8052ff',
          hover: '#6f3ff5',
          glow: 'rgba(128, 82, 255, 0.35)'
        },
        saffron: {
          DEFAULT: '#ffb829',
          glow: 'rgba(255, 184, 41, 0.3)'
        },
        verdant: {
          DEFAULT: '#15846e',
          glow: 'rgba(21, 132, 110, 0.3)'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.025em',
        widest: '0.15em'
      },
      borderRadius: {
        '3xl': '24px',
        pill: '9999px'
      },
      boxShadow: {
        'iris-glow': '0 0 25px -3px rgba(128, 82, 255, 0.45)',
        'saffron-glow': '0 0 20px -3px rgba(255, 184, 41, 0.4)',
        'ambient-stage': '0 20px 80px -20px rgba(128, 82, 255, 0.25)'
      }
    }
  },
  plugins: []
};
