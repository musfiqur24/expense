import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { getMonthRange } from "../utils/date.js";

function roundPercent(value) {
  return Math.round(value * 10) / 10;
}

async function expenseTotalsByCategory(userId, month) {
  const { start, end } = getMonthRange(month);
  const totals = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        date: { $gte: start, $lt: end }
      }
    },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } }
  ]);

  return new Map(totals.map((item) => [String(item._id), item.spent]));
}

export async function getBudgetProgress(userId, month) {
  const [budgets, totals] = await Promise.all([
    Budget.find({ user: userId, month }).populate("category", "name color icon type isArchived"),
    expenseTotalsByCategory(userId, month)
  ]);

  return budgets.map((budget) => {
    const budgetObject = budget.toObject();
    const spent = totals.get(String(budget.category?._id || budget.category)) || 0;
    const percent = roundPercent((spent / budget.amount) * 100);

    return {
      ...budgetObject,
      limit: budgetObject.amount,
      spent,
      percent,
      reached: spent >= budget.amount,
      exceeded: spent > budget.amount
    };
  });
}

export async function getBudgetAlertForTransaction(transaction, category) {
  if (transaction.type !== "expense") return null;

  const month = transaction.date.toISOString().slice(0, 7);
  const budget = await Budget.findOne({
    user: transaction.user,
    category: transaction.category,
    month
  });

  if (!budget) return null;

  const { start, end } = getMonthRange(month);
  const totalResult = await Transaction.aggregate([
    {
      $match: {
        user: transaction.user,
        category: transaction.category,
        type: "expense",
        date: { $gte: start, $lt: end }
      }
    },
    { $group: { _id: null, spent: { $sum: "$amount" } } }
  ]);
  const spent = totalResult[0]?.spent || 0;

  if (spent < budget.amount) return null;

  return {
    budgetId: budget._id,
    category: category
      ? { _id: category._id, name: category.name, color: category.color }
      : { _id: transaction.category },
    month,
    budget: budget.amount,
    limit: budget.amount,
    spent,
    percent: roundPercent((spent / budget.amount) * 100),
    reached: true,
    exceeded: spent > budget.amount,
    message: spent > budget.amount ? "This category has exceeded its monthly budget" : "This category has reached its monthly budget"
  };
}
