import CalendarView from "./CalendarView";
import SessionList from "./SessionList";

export default function HistoryScreen() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">History</h1>
      <CalendarView />
      <SessionList />
    </div>
  );
}
