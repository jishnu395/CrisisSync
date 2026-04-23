export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#0a0a0f', 800: '#12121a', 700: '#1a1a26', 600: '#222233', 500: '#2a2a3a' },
        crisis: '#ff2d55',
        'crisis-soft': 'rgba(255,45,85,0.1)',
        warn: '#ff9500',
        safe: '#30d158',
        info: '#5ac8fa',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'sos-ring': 'sosRing 2s ease-out infinite',
        'sos-ring-delay': 'sosRing 2s ease-out 0.5s infinite',
        'sos-pulse': 'sosPulse 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 0.4s ease-out',
        'slide-out': 'slideOut 0.3s ease-in forwards',
        'fade-in': 'fadeIn 0.3s ease',
        'modal-in': 'modalIn 0.4s ease-out',
        'glow-breathe': 'glowBreathe 8s ease-in-out infinite',
        'timer-blink': 'timerBlink 1s step-end infinite',
      },
      keyframes: {
        sosRing: { '0%': { transform: 'scale(1)', opacity: '1' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        sosPulse: { '0%, 100%': { boxShadow: '0 0 40px rgba(255,45,85,0.3)' }, '50%': { boxShadow: '0 0 80px rgba(255,45,85,0.6)' } },
        slideIn: { from: { transform: 'translateX(100px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideOut: { to: { transform: 'translateX(100px)', opacity: '0' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        modalIn: { from: { transform: 'scale(0.9) translateY(20px)', opacity: '0' }, to: { transform: 'scale(1) translateY(0)', opacity: '1' } },
        glowBreathe: { '0%, 100%': { opacity: '0.08' }, '50%': { opacity: '0.18' } },
        timerBlink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
};