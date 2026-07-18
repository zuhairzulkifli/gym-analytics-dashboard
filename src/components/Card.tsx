import type { CSSProperties, ReactNode } from "react";

type CardVariant = "default" | "emphasis" | "subtle";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  // Hero widgets: the PR board, the heatmap — the things worth looking at first.
  emphasis: "border border-slate-700 bg-slate-800/70",
  // Standard data panels: charts, lists.
  default: "border border-slate-800 bg-slate-900/60",
  // Utility forms: log-a-measurement, set-a-goal — present, not competing.
  subtle: "border border-transparent bg-slate-900/30"
};

export default function Card({
  children,
  className = "",
  variant = "default",
  revealDelayMs
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  /** When set, applies the entrance reveal with a staggered delay (ms). */
  revealDelayMs?: number;
}) {
  const style: CSSProperties | undefined =
    revealDelayMs !== undefined ? { animationDelay: `${revealDelayMs}ms` } : undefined;

  return (
    <div
      className={`rounded-xl p-4 ${VARIANT_CLASSES[variant]} ${revealDelayMs !== undefined ? "reveal" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
