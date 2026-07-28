import React from "react";

/**
 * Shared card container for each signed-in page introduction.
 */
export function PageHeader({ children }) {
  return (
    <div className="surface-card page-header-card">
      {children}
    </div>
  );
}
