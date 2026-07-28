import React from "react";

export function Button({ className = "", variant = "primary", type = "button", children, ...props }) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}
