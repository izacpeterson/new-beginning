/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#50cbc5",

          "primary-content": "#ffffff",

          secondary: "#99f6e4",

          "secondary-content": "#081512",

          accent: "#93c5fd",

          "accent-content": "#080e16",

          neutral: "#081604",

          "neutral-content": "#c7cbc5",

          "base-100": "#ffffff",

          "base-200": "#dedede",

          "base-300": "#bebebe",

          "base-content": "#161616",

          info: "#00e9ff",

          "info-content": "#001316",

          success: "#4ade80",

          "success-content": "#021206",

          warning: "#fb923c",

          "warning-content": "#150801",

          error: "#f8495d",

          "error-content": "#150203",
        },
      },
    ],
  },
};
