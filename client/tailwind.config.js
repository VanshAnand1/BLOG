/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        rgb: {
          "0%, 100%": { color: "rgb(0, 250, 250)" },
          "50%": { color: "rgb(250, 250, 0)" },
        },
      },
      animation: {
        rgb: "rgb 2s infinite", // name, duration, repeat
      },
      colors: {
        darkgray: "#30323D",
        lightgray: "#4D5061",
        blue: "#5C80BC",
        ashgray: "#CDD1C4",
        teagreen: "#C5E6A6",
        aliceblue: "#D9F0FF",
        magnolia: "#F8F0FB",
        zomp: "#619B8A",
        sunset: "#F2D0A4",
        aquamarine: "#A6F4DC",
        tropicalindigo: "#A288E3",
        seagreen: "#388659",
        periwinkle: "#A7ABDD",
      },
    },
  },
  plugins: [],
};
