import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm editorial palette — near-black charcoal + cream + terracotta,
        // replacing the earlier cool slate/blue "product" scheme. Every pairing
        // below is contrast-checked against its actual usage, not assumed.
        surface: {
          DEFAULT: "#17140f", // body background
          card: "#211c15", // standard card / input / pill background
          raised: "#2b241b", // emphasis card, hover state one step up
          raised2: "#362d21", // hover state one step up from raised
          border: "#382f22"
        },
        ink: {
          DEFAULT: "#f2ead9", // primary text — 15.4:1 on surface
          muted: "#a89a83" // captions/secondary — 6.7:1 on surface, 6.1:1 on surface-card
        },
        accent: {
          // Solid-fill buttons/pills — white text on this is 4.80:1 (DEFAULT
          // #c4633c only hits 4.04:1, fails, so buttons use this darker shade).
          DEFAULT: "#b8552e",
          dark: "#9c4726",
          // On-dark text use (streak counters, active tab, links) — 7.0:1.
          text: "#e08a5f",
          // Decorative/chart use where text-contrast rules don't apply — the
          // lighter, more vivid terracotta from the reference palette.
          light: "#c4633c"
        },
        danger: {
          DEFAULT: "#e2695a" // warm red, 5.6:1 on surface — keeps the family instead of Tailwind's cool red-400
        }
      },
      fontFamily: {
        // Editorial serif for display/titles; sans stays the system stack for
        // everything else (data, labels, nav) — contrast-axis pairing, not two
        // similar faces.
        display: ["Fraunces", "ui-serif", "Georgia", "serif"]
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
} satisfies Config;
