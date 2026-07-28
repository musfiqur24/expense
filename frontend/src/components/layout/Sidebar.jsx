import React from "react";
import { ArrowLeftRight, LayoutDashboard, LogOut, Tags, Target, WalletCards } from "lucide-react";

const items = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "budgets", label: "Budgets", icon: Target },
  { id: "categories", label: "Categories", icon: Tags }
];

export function Sidebar({ route, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand-card">
        <button className="brand brand--sidebar" type="button" onClick={() => onNavigate("dashboard")} aria-label="Go to overview">
          <span className="brand__mark"><WalletCards size={21} /></span>
          <span>Budget Buddy</span>
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            className={`nav-item ${route === id ? "nav-item--active" : ""}`}
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__tip">
          <span className="sidebar__tip-dot" />
          <p>Your money, clearly organised.</p>
        </div>
        <button className="nav-item nav-item--logout" type="button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export { items as navigationItems };
