import { useEffect, useState } from "react";
import { useWorkoutStore } from "../../store/workoutStore";

export default function RestTimer() {
  const restEndsAt = useWorkoutStore((s) => s.restEndsAt);
  const clearRest = useWorkoutStore((s) => s.clearRest);
  const startRest = useWorkoutStore((s) => s.startRest);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!restEndsAt) return;
    const tick = () => {
      const remaining = restEndsAt - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        if (navigator.vibrate) navigator.vibrate(200);
        clearRest();
      } else {
        setRemainingMs(remaining);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [restEndsAt, clearRest]);

  if (!restEndsAt) return null;

  const seconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <div className="reveal fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-surface-raised px-4 py-2 shadow-lg">
      <span className="text-lg font-semibold tabular-nums">
        {mm}:{ss.toString().padStart(2, "0")}
      </span>
      <button
        className="rounded-full bg-surface-raised2 px-3 py-1 text-xs transition-colors duration-200 hover:bg-surface-border"
        onClick={() => startRest(Math.max(seconds - 15, 0))}
      >
        -15s
      </button>
      <button
        className="rounded-full bg-surface-raised2 px-3 py-1 text-xs transition-colors duration-200 hover:bg-surface-border"
        onClick={() => startRest(seconds + 15)}
      >
        +15s
      </button>
      <button
        className="rounded-full bg-accent px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-accent-dark"
        onClick={clearRest}
      >
        Skip
      </button>
    </div>
  );
}
