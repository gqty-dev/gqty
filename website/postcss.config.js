/**
 * Single project-owned CSS pipeline: the stylesheet in `styles/globals.css` is
 * the only source of site styling. No design-system PostCSS plugin is loaded.
 */
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
