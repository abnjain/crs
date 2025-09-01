/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color: #2563EB)',
        secondary: 'var(--secondary-color: #1E40AF)',
        tertiary: 'var(--tertiary-color: #38BDF8)',
        background: 'var(--background-color: #F9FAFB)',
        text: 'var(--text-color: #111827)',
        secondText: 'var(--second-text-color: #6B7280)',
        surface: 'var(--surface-color: #FFFFFF)',
        primaryDark: 'var(--primary-color: #7C3AED)',
        secondaryDark: 'var(--secondary-color: #9333EA)',
        tertiaryDark: 'var(--tertiary-color: #06B6D4)',
        backgroundDark: 'var(--background-color: #0F172A)',
        surfaceDark: 'var(--surface-color: #1E293B)',
        textDark: 'var(--text-color: #F1F5F9)',
        secondTextDark: 'var(--second-text-color: #94A3B8)',
      },
      fontFamily: {
        body: 'var(--font-family-body)',
      },
    },
  },
  plugins: [],
}

