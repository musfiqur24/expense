import React from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  children,
  route,
  navigate,
  user,
  month,
  onMonthChange,
  onLogout,
  onAddTransaction
}) {
  return (
    <div className="app-frame">
      <Sidebar route={route} onNavigate={navigate} onLogout={onLogout} />
      <div className="app-frame__content">
        <Topbar user={user} month={month} onMonthChange={onMonthChange} onAddTransaction={onAddTransaction} />
        <main className="page-content">{children}</main>
      </div>
      <MobileNav route={route} onNavigate={navigate} />
    </div>
  );
}
