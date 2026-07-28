import React from "react";
import { navigationItems } from "./Sidebar";

export function MobileNav({ route, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigationItems.map(({ id, label, icon: Icon }) => (
        <button
          className={`mobile-nav__item ${route === id ? "mobile-nav__item--active" : ""}`}
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
