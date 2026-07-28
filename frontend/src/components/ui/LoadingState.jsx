import React from "react";

export function LoadingState({ label = "Loading your finances...", compact = false }) {
  return (
    <div className={`loading-state ${compact ? "loading-state--compact" : ""}`} role="status" aria-live="polite">
      <span className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}
