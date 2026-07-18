import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import TodayPage from "./pages/TodayPage";
import TrainPage from "./pages/TrainPage";
import HistoryPage from "./pages/HistoryPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import { db, ensureDefaultSettings } from "./db/schema";
import { seedExercises } from "./data/exerciseSeed";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([seedExercises(db), ensureDefaultSettings()]).then(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center">Loading…</div>;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}
