import React from "react";
import { AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { budgetCategory, budgetLimit, budgetPercent, budgetSpent, isBudgetExceeded } from "../../utils/data";
import { formatCurrency } from "../../utils/format";

export function BudgetCard({ budget, onEdit, onDelete, compact = false }) {
  const category = budgetCategory(budget);
  const limit = budgetLimit(budget);
  const spent = budgetSpent(budget);
  const percent = budgetPercent(budget);
  const exceeded = isBudgetExceeded(budget);
  const id = budget._id || budget.id;

  return (
    <article className={`budget-card ${exceeded ? "budget-card--over" : ""} ${compact ? "budget-card--compact" : ""}`}>
      <div className="budget-card__topline">
        <div className="budget-card__category">
          <span className="category-dot" style={category.color ? { backgroundColor: category.color } : undefined} />
          <strong>{category.name}</strong>
        </div>
        {!compact && <div className="budget-card__actions">
          <button type="button" aria-label={`Edit ${category.name} budget`} onClick={() => onEdit?.(budget)}><Pencil size={15} /></button>
          <button type="button" aria-label={`Delete ${category.name} budget`} onClick={() => onDelete?.(budget)}><Trash2 size={15} /></button>
        </div>}
        {compact && <MoreHorizontal size={18} aria-hidden="true" />}
      </div>
      <div className="budget-card__numbers">
        <strong>{formatCurrency(spent)}</strong>
        <span>of {formatCurrency(limit)}</span>
      </div>
      <div className="budget-progress" aria-label={`${Math.round(percent)} percent of ${category.name} budget used`}>
        <span style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
      </div>
      <div className="budget-card__footer">
        {exceeded ? <span className="budget-alert"><AlertTriangle size={14} />Over by {formatCurrency(Math.max(spent - limit, 0))}</span> : <span>{Math.max(0, Math.round(percent))}% used</span>}
        {!exceeded && <strong>{formatCurrency(Math.max(limit - spent, 0))} left</strong>}
      </div>
      <input type="hidden" value={id || ""} readOnly />
    </article>
  );
}
