/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Figma “Gray/Warm” tokens
      colors: {
        warm: {
          300: "#E6E6E6", // dividers/borders
          700: "#62605C", // body text/buttons
          800: "#41403D", // headings
        },
        brand: {
          violet: "#8952FC",
        },
      },
      // Use DM Sans via className="font-dm" where needed (modal)
      fontFamily: {
        dm: ["var(--font-dm-sans)", ...defaultTheme.fontFamily.sans],
      },
      // Shadows used by the Step 1 screen
      boxShadow: {
        "image-3d":
          "inset 0 0 0 2px rgba(255,255,255,0.30), 0 2px 6px rgba(16,24,40,0.06), 0 18px 40px rgba(16,24,40,0.18)",
        "sheet-top": "0 -8px 24px rgba(16,24,40,0.12)",
        "card-3d": "0 16px 48px rgba(16,24,40,0.18)",
      },
      borderRadius: {
        modal: "20px",
        img: "12px",
        btn: "10px",
      },
    },
  },
  plugins: [],
};

export default config;