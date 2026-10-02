const { getTheme } = require("reshaped/config/tailwind");

/** @type {import('twind').Configuration} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  mode: "silent",
  theme: {
    extend: getTheme(),
    colors: {
      transparent: "transparent",
      black: "#000",
      white: "#fff",
      primaryPink: "#E767C0",
      success: "#85F273",
      warning: "#FFEB7C",
      error: "#FF8579",

      surface: {
        50: "#F5F5F5",
        100: "#DCDCDC",
        200: "#C3C3C3",
        300: "#ABA9AA",
        400: "#929091",
        500: "#797779",
        600: "#605E60",
        700: "#474447",
        800: "#2E2B2E",
        900: "#151215",
      },
    },
  },
  plugins: [],
};
