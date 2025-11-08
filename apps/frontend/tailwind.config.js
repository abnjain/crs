// ./tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        info: 'var(--info-color)',
        danger: 'var(--danger-color)',
        success: 'var(--success-color)',
        warning: 'var(--warning-color)',
      },
    },
  },
  plugins: [],
}

