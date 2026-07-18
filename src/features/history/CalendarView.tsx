import { useEffect, useState } from "react";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import Card from "../../components/Card";
import { getTrainedDates } from "../../db/queries/history";
import { computeStreak } from "../../utils/calculations";

export default function CalendarView() {
  const [trainedDates, setTrainedDates] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getTrainedDates().then((dates) => {
      setTrainedDates(new Set(dates));
      setStreak(computeStreak(dates));
    });
  }, []);

  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold">{format(today, "MMMM yyyy")}</span>
        <span className="text-sm text-accent-text">🔥 {streak} day streak</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const trained = trainedDates.has(key);
          return (
            <div
              key={key}
              className={`rounded-full py-1 transition-colors duration-200 ${trained ? "bg-accent text-white" : "text-ink-muted"}`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
