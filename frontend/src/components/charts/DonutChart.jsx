import React from "react";
import { categoryBreakdownItem } from "../../utils/data";
import { formatCurrency } from "../../utils/format";

const COLORS = ["#6559e8", "#18a480", "#f0a348", "#e66f88", "#3c9ae8", "#9a72e5", "#6c9f45"];

export function DonutChart({ breakdown = [] }) {
  const items = (Array.isArray(breakdown) ? breakdown : [])
    .map(categoryBreakdownItem)
    .filter((item) => item.amount > 0)
    .slice(0, 7);
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  if (!items.length || total <= 0) {
    return <div className="chart-empty">Category spending will appear once you add expenses.</div>;
  }

  let cursor = 0;
  const segments = items.map((item, index) => {
    const start = cursor;
    cursor += (item.amount / total) * 100;
    const color = item.category.color || COLORS[index % COLORS.length];
    return { ...item, color, start, end: cursor };
  });
  const gradient = `conic-gradient(${segments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ")})`;

  return (
    <div className="donut-chart">
      <div className="donut-chart__ring" style={{ background: gradient }} role="img" aria-label={`Total spending ${formatCurrency(total)}`}>
        <div className="donut-chart__center">
          <span>Spent</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
      <ul className="donut-chart__legend">
        {segments.map((item) => (
          <li key={`${item.category.id}-${item.category.name}`}>
            <i style={{ backgroundColor: item.color }} />
            <span>{item.category.name}</span>
            <strong>{Math.round((item.amount / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
