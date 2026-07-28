import { toNumber } from "./format";

const DEFAULT_CATEGORY_COLOR = "#64748B";
const CATEGORY_COLOR_PALETTE = ["#7C3AED", "#2563EB", "#0891B2", "#0F766E", "#C2410C", "#BE185D", "#B45309"];

export function getId(value) {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
}

export function getCategory(value) {
  if (!value) return { id: "", name: "Uncategorized", color: "", icon: "" };
  if (typeof value === "string") return { id: value, name: value, color: "", icon: "" };

  return {
    id: value._id || value.id || "",
    name: value.name || value.title || value.label || "Uncategorized",
    color: value.color || "",
    icon: value.icon || ""
  };
}

export function categoryColor(category, type = "expense") {
  const color = String(category?.color || "");
  if (/^#[0-9A-F]{6}$/i.test(color) && color.toUpperCase() !== DEFAULT_CATEGORY_COLOR) return color;

  const name = String(category?.name || category?.title || category || "").trim();
  if (name) {
    const hash = Array.from(name).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
    return CATEGORY_COLOR_PALETTE[hash % CATEGORY_COLOR_PALETTE.length];
  }

  return type === "income" ? "#168663" : "#6259D9";
}

export function transactionCategory(transaction = {}) {
  return getCategory(transaction.category || transaction.categoryId || transaction.categoryName);
}

export function transactionDate(transaction = {}) {
  return transaction.date || transaction.transactedAt || transaction.spentAt || transaction.occurredAt || transaction.createdAt;
}

export function transactionType(transaction = {}) {
  return String(transaction.type || "expense").toLowerCase() === "income" ? "income" : "expense";
}

export function transactionAmount(transaction = {}) {
  return toNumber(transaction.amount ?? transaction.value ?? transaction.total);
}

export function budgetCategory(budget = {}) {
  return getCategory(budget.category || budget.categoryId || budget.categoryName);
}

export function budgetLimit(budget = {}) {
  return toNumber(budget.limit ?? budget.amount ?? budget.budgetLimit);
}

export function budgetSpent(budget = {}) {
  return toNumber(budget.spent ?? budget.totalSpent ?? budget.used);
}

export function budgetPercent(budget = {}) {
  const provided = toNumber(budget.percent ?? budget.percentage, -1);
  if (provided >= 0) return provided;
  const limit = budgetLimit(budget);
  return limit > 0 ? (budgetSpent(budget) / limit) * 100 : 0;
}

export function isBudgetExceeded(budget = {}) {
  return Boolean(budget.exceeded) || budgetPercent(budget) > 100 || budgetSpent(budget) > budgetLimit(budget);
}

export function categoryBreakdownItem(item = {}) {
  const category = getCategory(item.category || item.categoryId || item._id || item.name);
  return {
    ...item,
    category,
    amount: toNumber(item.amount ?? item.total ?? item.expense ?? item.spent ?? item.value)
  };
}
