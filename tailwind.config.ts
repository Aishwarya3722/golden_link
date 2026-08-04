import type { Config } from "tailwindcss";

// Color system: each module gets one unmistakable, high-contrast color so
// seniors recognize a function by color alone, not just by reading text.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emergency: {
          DEFAULT: "#DC2626", // red — panic-button clarity
          dark: "#991B1B",
        },
        pills: {
          DEFAULT: "#2563EB", // blue — medicine / health
          dark: "#1D4ED8",
        },
        services: {
          DEFAULT: "#EA580C", // orange — repairs / home help
          dark: "#C2410C",
        },
        community: {
          DEFAULT: "#7C3AED", // purple — social / hangout
          dark: "#6D28D9",
        },
        family: {
          DEFAULT: "#DB2777", // rose — family linkage
          dark: "#BE185D",
        },
        golden: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          900: "#78350F",
        },
        ink: {
          900: "#111827",
          700: "#374151",
        },
      },
      fontSize: {
        // Base sizes are deliberately larger than typical web defaults.
        base: ["18px", "1.6"],
        lg: ["20px", "1.6"],
        xl: ["24px", "1.5"],
        "2xl": ["30px", "1.4"],
        "3xl": ["36px", "1.3"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      minHeight: {
        touch: "64px", // minimum tap-target height across the app
      },
    },
  },
  plugins: [],
};

export default config;
