/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          elevated: 'var(--bg-elevated)',
          border: 'var(--border-subtle)'
        },
        bone: 'var(--text-primary)',
        ash: 'var(--text-secondary)',
        silver: 'var(--text-secondary)',
        iris: {
          DEFAULT: 'var(--accent-iris)',
          hover: 'var(--accent-iris-hover)',
          glow: 'var(--shadow-iris)'
        },
        saffron: {
          DEFAULT: 'var(--accent-saffron)',
          glow: 'rgba(255, 184, 41, 0.3)'
        },
        verdant: {
          DEFAULT: 'var(--accent-verdant)',
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
        'iris-glow': 'var(--shadow-iris)',
        'saffron-glow': '0 0 20px -3px rgba(255, 184, 41, 0.4)',
        'ambient-stage': 'var(--shadow-ambient)'
      }
    }
  },
  plugins: []
};
