/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          primary: '#0f1419',
          secondary: '#1a1f2e',
          tertiary: '#252b3b',
          hover: '#2d3548',
        },
        // Accent colors matching existing theme
        accent: {
          primary: '#1d9bf0',
          success: '#00ba7c',
          warning: '#ffad1f',
          danger: '#f4212e',
          purple: '#7856ff',
        },
      },
      maxWidth: {
        container: '1400px',
      },
    },
  },
  plugins: [],
}
