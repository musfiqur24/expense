import { toNumber } from "./format";

export function getId(value) {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
}

export function getCategory(value) {
  if (!value) return { id: "", name: "Uncategorized", color: "" };
  if (typeof value === "string") return { id: value, name: value, color: "" };

  return {
    id: value._id || value.id || "",
    name: value.name || value.title || value.label || "Uncategorized",
    color: value.color || ""
  };
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
