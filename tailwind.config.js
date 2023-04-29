/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    darkMode: "class",
    mode: "jit",
    theme: {
        extend: {},
        fontFamily: {
            sans: ["Fira sans", "sans-serif"],
        },
    },
    plugins: [],
};
