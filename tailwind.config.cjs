/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,mdx}"],
  plugins: [],
  presets: [require("@navikt/ds-tailwind")],
};
