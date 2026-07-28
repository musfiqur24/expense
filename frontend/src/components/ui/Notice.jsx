import React from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export function Notice({ notice, onDismiss }) {
  if (!notice) return null;
  const isError = notice.tone === "error";
  return (
    <div className={`notice notice--${notice.tone || "success"}`} role="status">
      {isError ? <CircleAlert size={19} /> : <CheckCircle2 size={19} />}
      <span>{notice.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message"><X size={16} /></button>
    </div>
  );
}
