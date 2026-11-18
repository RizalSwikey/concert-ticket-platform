/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Tailwind needs raw RGB triplets to support `/opacity` modifiers.
      // `--*-rgb` vars live in index.css; hex aliases stay for inline SVG.
      colors: {
        void: {
          DEFAULT: 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          card: 'rgb(var(--bg-card-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
          // Hairline borders are used without opacity modifiers, so the raw
          // rgba/hex var is simplest and stays exact in both themes.
          border: 'var(--border-subtle)'
        },
        bone: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        ash: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        silver: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        tertiary: 'rgb(var(--text-tertiary-rgb) / <alpha-value>)',
        iris: {
          DEFAULT: 'rgb(var(--accent-iris-rgb) / <alpha-value>)',
          hover: 'rgb(var(--accent-iris-hover-rgb) / <alpha-value>)'
        },
        saffron: 'rgb(var(--accent-saffron-rgb) / <alpha-value>)',
        verdant: 'rgb(var(--accent-verdant-rgb) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      letterSpacing: {
        tighter: '-0.045em',
        tight: '-0.02em',
        wide: '0.025em',
        widest: '0.18em'
      },
      borderRadius: {
        lg: '8px',
        pill: '9999px'
      },
      boxShadow: {
        // Design rule: no elevation shadows. Keys kept because context/ and dev
        // panels still reference them; they resolve to a hairline ring.
        'iris-glow': '0 0 0 1px rgb(var(--accent-iris-rgb) / 0.6)',
        'saffron-glow': '0 0 0 1px rgb(var(--accent-saffron-rgb) / 0.5)',
        'ambient-stage': 'none'
      },
      maxWidth: {
        page: '1280px'
      }
    }
  },
  plugins: []
};
