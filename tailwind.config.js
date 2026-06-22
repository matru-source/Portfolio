/** @type {import('tailwindcss').Config} */
// Matru Panda — warm editorial theme (Rolf Jensen-inspired).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', lg: '2.5rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        ink: '#1A1714', // headings / near-black warm
        body: '#57514A', // body text
        muted: '#6E6557', // secondary / mono labels (WCAG AA on cream)
        line: '#E6E0D4', // borders / dividers
        canvas: '#F1ECE2', // alt-section background (deeper cream)
        surface: '#FAF7F1', // page background (light cream)
        primary: {
          DEFAULT: '#B4592F', // terracotta accent
          50: '#F8EFE8',
          100: '#EDD8CB',
          200: '#DEBBA5',
          600: '#9A4A26',
          700: '#7E3C1F',
        },
        accent: {
          DEFAULT: '#7A7A52', // muted olive — sparing secondary accent
          600: '#5F5F3F',
        },
        success: '#4F7A52',
        warning: '#B4742F',
        danger: '#B4453A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,23,20,0.03), 0 12px 30px rgba(26,23,20,0.05)',
        'card-hover': '0 2px 6px rgba(26,23,20,0.05), 0 24px 50px rgba(26,23,20,0.10)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
