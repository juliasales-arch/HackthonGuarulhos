const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./page.tsx",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#eef4ff",
          100: "#dce7ff",
          200: "#b6ccff",
          300: "#86a9ff",
          400: "#5d86f6",
          500: "#4068e0",
          600: "#2d4fba",
          700: "#243f92",
          800: "#1b336f",
          900: "#132446",
          950: "#0b1429",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(9, 18, 44, 0.18)",
      },
      backgroundImage: {
        "mesh-radial":
          "radial-gradient(circle at top left, rgba(64,104,224,0.18), transparent 34%), radial-gradient(circle at 80% 20%, rgba(18, 99, 255, 0.11), transparent 28%), radial-gradient(circle at 60% 90%, rgba(4, 126, 129, 0.14), transparent 24%)",
      },
    },
  },
  plugins: [],
};

export default config;
