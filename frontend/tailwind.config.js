/** @type {import('tailwindcss').Config} */
export default {
  // Configure the paths to all of your template files.
  // Tailwind will scan these files for class names and generate the corresponding CSS.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // The theme section is where you define your project's color palette,
  // type scale, fonts, breakpoints, border radius values, and more.
  theme: {
    // The extend key allows you to add new values to the default theme
    // without overriding them entirely.
    extend: {},
  },
  
  // The plugins section allows you to register third-party plugins with Tailwind.
  plugins: [],
};
