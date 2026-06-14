/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // ── RFA Brand colours extracted from rfanam.com.na ──────
        brand: {
          50:  '#f0faf4',
          100: '#dbf2e5',
          200: '#b8e5cc',
          300: '#84d0a8',
          400: '#4ab47e',
          500: '#27975e',
          600: '#1a7a4a',  // primary CTA — mid forest green
          700: '#166040',  // hover
          800: '#145034',  // pressed
          900: '#0e3a25',  // deepest
          950: '#07201a',
        },
        // Namibia flag gold / amber
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#C9A227',  // RFA gold
          600: '#a17c1a',
          700: '#7c5e10',
          800: '#5c440a',
          900: '#3d2e07',
        },
        // Namibia flag blue (accent / links)
        rfa: {
          blue:  '#003580',
          red:   '#C8102E',
          green: '#009A44',
          gold:  '#C9A227',
        },
        // Neutral surface palette (dark UI)
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f1f13',   // shifted slightly green-dark for RFA
          950: '#080f0a',
        },
      },
      backgroundImage: {
        'hero-pattern':   "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'road-texture':   'linear-gradient(150deg, #0a1f0e 0%, #07120c 55%, #05180a 100%)',
        'rfa-gradient':   'linear-gradient(135deg, #0e3a25 0%, #07200e 60%, #030d05 100%)',
        'gold-gradient':  'linear-gradient(90deg, #C9A227 0%, #fbbf24 100%)',
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease-out',
        'slide-up':       'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow':     'pulse 3s infinite',
        'spin-slow':      'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' },                                           '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(20px)', opacity: '0' },            '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(20px)', opacity: '0' },            '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(26, 122, 74, 0.30)',
        'glow-gold':  '0 0 20px rgba(201, 162, 39, 0.25)',
        'glow-red':   '0 0 20px rgba(200, 16, 46, 0.25)',
        'card':       '0 1px 3px rgba(0,0,0,0.08), 0 10px 40px rgba(0,0,0,0.15)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.10), 0 20px 60px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};
