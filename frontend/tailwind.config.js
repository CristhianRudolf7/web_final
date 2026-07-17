/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'eco-green-light': '#E8F5E9',
        'eco-green-primary': '#2E7D32',
        'eco-green-dark': '#1B5E20',
        'eco-white': '#FFFFFF',
      },
      borderRadius: {
        'eco-sm': '12px',
        'eco-md': '18px',
        'eco-lg': '24px',
      },
      boxShadow: {
        soft: '0 14px 40px rgba(27, 94, 32, 0.09)',
      },
    },
  },
  plugins: [],
}
