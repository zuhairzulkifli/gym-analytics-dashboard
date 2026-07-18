import CalendarView from "./CalendarView";
import SessionList from "./SessionList";

export default function HistoryScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">History</h1>
      <CalendarView />
      <SessionList />
    </div>
  );
}
