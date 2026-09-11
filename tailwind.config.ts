import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Evergreen Blue Palette
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Evergreen brand accent
        evergreen: {
          50:  "#eef9ff",
          100: "#d9f1ff",
          200: "#bbe5ff",
          300: "#8bd6ff",
          400: "#52beff",
          500: "#29a3fc",
          600: "#0e84f1",
          700: "#076ede",
          800: "#0c58b4",
          900: "#104a8e",
          950: "#0c2d57",
        },
        // Dark mode surface colors
        dark: {
          bg:      "#080e1c",
          surface: "#0f1928",
          card:    "#131f33",
          border:  "#1e2d45",
          muted:   "#1a2840",
        },
        // Light mode surface
        light: {
          bg:      "#f0f4fb",
          surface: "#ffffff",
          card:    "#ffffff",
          border:  "#e2e8f0",
          muted:   "#f8fafc",
        },
        // Status colors
        success: {
          light: "#22c55e",
          dark:  "#16a34a",
          bg:    "#f0fdf4",
        },
        danger: {
          light: "#ef4444",
          dark:  "#dc2626",
          bg:    "#fef2f2",
        },
        warning: {
          light: "#f59e0b",
          dark:  "#d97706",
          bg:    "#fffbeb",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-blue":  "0 0 20px rgba(37, 99, 235, 0.25)",
        "glow-sm":    "0 0 10px rgba(37, 99, 235, 0.15)",
        "card-light": "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-dark":  "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        "nav":        "0 1px 0 rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "gradient-blue":       "linear-gradient(135deg, #1d4ed8 0%, #0e84f1 100%)",
        "gradient-blue-dark":  "linear-gradient(135deg, #172554 0%, #0c2d57 100%)",
        "gradient-card":       "linear-gradient(145deg, rgba(30,64,175,0.12) 0%, rgba(14,132,241,0.06) 100%)",
        "mesh":                "radial-gradient(at 20% 50%, rgba(37,99,235,0.15) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(14,132,241,0.1) 0px, transparent 50%)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "slide-in-l": "slideInLeft 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
