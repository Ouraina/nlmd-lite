/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brandGreen: '#10b981',        // Your signature green
        brandGreenDark: '#065f46',    // Darker green for hovers
        brandWhite: '#ffffff',        // Clean white
        brandGray: '#1f2937',         // Dark gray for backgrounds
        brandSlate: '#64748b',        // Light gray for text
      },
    },
    },
  plugins: [],
};
