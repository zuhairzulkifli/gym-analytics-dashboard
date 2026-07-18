import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Today", icon: "🏠" },
  { to: "/train", label: "Train", icon: "🏋️" },
  { to: "/history", label: "History", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/settings", label: "Settings", icon: "⚙️" }
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-slate-800 bg-slate-900 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              isActive ? "text-brand" : "text-slate-400"
            }`
          }
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
