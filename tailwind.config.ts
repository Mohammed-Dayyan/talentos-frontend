import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4338ca', foreground: '#ffffff', 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 900: '#312e81' },
        background: '#f8fafc',
        foreground: '#0f172a',
        card: { DEFAULT: '#ffffff', foreground: '#0f172a' },
        border: '#e2e8f0',
        input: '#e2e8f0',
        muted: { DEFAULT: '#f1f5f9', foreground: '#64748b' },
        accent: { DEFAULT: '#f1f5f9', foreground: '#0f172a' },
        success: { DEFAULT: '#10b981', light: '#d1fae5' },
        warning: { DEFAULT: '#f59e0b', light: '#fef3c7' },
        destructive: { DEFAULT: '#ef4444', foreground: '#ffffff', light: '#fee2e2' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      borderRadius: { lg: '0.5rem', md: '0.375rem', sm: '0.25rem' },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
