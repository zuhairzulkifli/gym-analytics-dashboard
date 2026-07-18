import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Background/border use only — 3.45:1 on the dark body, fails as text.
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          // On-dark text use — 7.0:1 against the #0f172a body, same hue family.
          text: "#60a5fa"
        }
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
} satisfies Config;
