/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1b19',       // near-black, like unexposed film
        paper: '#faf8f4',     // warm darkroom paper white
        rust: '#b5502e',      // the iris blade copper — primary accent
        amber: '#e0a15c',     // safelight glow — highlights, hover states
        moss: '#4a5a40',      // for FOR_SALE / active-listing status
        gold: '#c9962f',      // for LISTED status, subtle metallic accents
        sand: '#e7ded0',      // borders, dividers, card backgrounds
        charcoal: '#2a2724',  // secondary dark surface (headers, nav)
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
