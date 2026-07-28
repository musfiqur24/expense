import React from "react";
import { formatCurrency, formatShortMonth, toNumber } from "../../utils/format";

const WIDTH = 720;
const HEIGHT = 250;
const PAD = { top: 20, right: 12, bottom: 34, left: 12 };

function getValue(item, key) {
  if (key === "income") return toNumber(item.income ?? item.totalIncome ?? item.earned);
  return toNumber(item.expense ?? item.expenses ?? item.totalExpense ?? item.spent);
}

function getLabel(item, index) {
  return item.month || item.label || item.date || `Period ${index + 1}`;
}

function pointsFor(series, key, maximum) {
  const usableWidth = WIDTH - PAD.left - PAD.right;
  const usableHeight = HEIGHT - PAD.top - PAD.bottom;
  const divisor = Math.max(series.length - 1, 1);
  return series.map((item, index) => {
    const x = PAD.left + (index / divisor) * usableWidth;
    const y = PAD.top + usableHeight - (getValue(item, key) / maximum) * usableHeight;
    return { x, y, value: getValue(item, key) };
  });
}

export function TrendChart({ trend = [] }) {
  const series = Array.isArray(trend) ? trend.slice(-8) : [];

  if (!series.length) {
    return <div className="chart-empty">Your monthly income and spending history will appear here.</div>;
  }

  const maximum = Math.max(...series.flatMap((item) => [getValue(item, "income"), getValue(item, "expense")]), 1);
  const incomePoints = pointsFor(series, "income", maximum);
  const expensePoints = pointsFor(series, "expense", maximum);
  const toPolyline = (points) => points.map(({ x, y }) => `${x},${y}`).join(" ");
  const usableHeight = HEIGHT - PAD.top - PAD.bottom;

  return (
    <div className="trend-chart">
      <div className="chart-legend" aria-label="Chart legend">
        <span><i className="legend-dot legend-dot--income" />Income</span>
        <span><i className="legend-dot legend-dot--expense" />Expenses</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Income and expense history by month" preserveAspectRatio="none">
        {[0, 1, 2, 3].map((line) => {
          const y = PAD.top + (line / 3) * usableHeight;
          return <line className="trend-chart__grid" key={line} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />;
        })}
        <polyline className="trend-chart__line trend-chart__line--income" points={toPolyline(incomePoints)} />
        <polyline className="trend-chart__line trend-chart__line--expense" points={toPolyline(expensePoints)} />
        {incomePoints.map(({ x, y, value }, index) => (
          <circle className="trend-chart__point trend-chart__point--income" cx={x} cy={y} r="3.8" key={`income-${index}`}>
            <title>{`Income: ${formatCurrency(value)}`}</title>
          </circle>
        ))}
        {expensePoints.map(({ x, y, value }, index) => (
          <circle className="trend-chart__point trend-chart__point--expense" cx={x} cy={y} r="3.8" key={`expense-${index}`}>
            <title>{`Expenses: ${formatCurrency(value)}`}</title>
          </circle>
        ))}
        {series.map((item, index) => {
          const x = incomePoints[index].x;
          return <text className="trend-chart__label" key={`label-${index}`} x={x} y={HEIGHT - 8} textAnchor="middle">{formatShortMonth(getLabel(item, index))}</text>;
        })}
      </svg>
    </div>
  );
}
