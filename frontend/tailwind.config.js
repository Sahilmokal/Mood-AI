/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: '#0a0a0f',
        surface: '#111118',
        panel: '#16161f',
        border: '#1e1e2e',
        muted: '#2a2a3a',
        dim: '#64648a',
        soft: '#9898b8',
        ghost: '#c8c8e0',
        snow: '#f0f0ff',
        volt: '#c8ff00',
        aurora: '#00ffc8',
        rose: '#ff4f7b',
        amber: '#ffb830',
        violet: '#8b5cf6',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-volt': 'pulseVolt 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'fadeUp': 'fadeUp 0.5s ease-out forwards',
        'slideIn': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseVolt: { '0%,100%': { boxShadow: '0 0 20px #c8ff0040' }, '50%': { boxShadow: '0 0 40px #c8ff0080' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(-12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
}
