import React from "react";

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && <span className="empty-state__icon"><Icon size={24} /></span>}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
