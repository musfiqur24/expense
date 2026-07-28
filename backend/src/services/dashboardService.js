import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import { getBudgetProgress } from "./budgetService.js";
import { getMonthRange, monthKeysEndingAt } from "../utils/date.js";

function totalsByType(rows) {
  return rows.reduce(
    (totals, row) => {
      totals[row._id] = row.total;
      return totals;
    },
    { income: 0, expense: 0 }
  );
}

export async function buildDashboard(userId, month) {
  const { start, end } = getMonthRange(month);
  const trendMonths = monthKeysEndingAt(month);
  const trendStart = getMonthRange(trendMonths[0]).start;

  const [summaryRows, categoryRows, trendRows, budgets, recentTransactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: { category: "$category", type: "$type" }, amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } }
    ]),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: trendStart, $lt: end } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date", timezone: "UTC" } },
            type: "$type"
          },
          amount: { $sum: "$amount" }
        }
      }
    ]),
    getBudgetProgress(userId, month),
    Transaction.find({ user: userId, date: { $gte: start, $lt: end } })
      .populate("category", "name color icon type")
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .lean()
  ]);

  const categoryIds = [...new Set(categoryRows.map((row) => String(row._id.category)))];
  const categories = await Category.find({ _id: { $in: categoryIds }, user: userId })
    .select("name color icon type")
    .lean();
  const categoriesById = new Map(categories.map((category) => [String(category._id), category]));

  // The primary breakdown is expense-only because it powers the spending chart.
  // Income remains available separately for clients that want to visualize sources of income.
  const categoryBreakdown = [];
  const incomeCategoryBreakdown = [];
  for (const row of categoryRows) {
    const category = categoriesById.get(String(row._id.category));
    if (category) {
      const item = { category, amount: row.amount };
      if (row._id.type === "expense") categoryBreakdown.push(item);
      else incomeCategoryBreakdown.push(item);
    }
  }

  const trendMap = new Map();
  for (const row of trendRows) {
    const current = trendMap.get(row._id.month) || { income: 0, expense: 0 };
    current[row._id.type] = row.amount;
    trendMap.set(row._id.month, current);
  }

  const trend = trendMonths.map((trendMonth) => {
    const values = trendMap.get(trendMonth) || { income: 0, expense: 0 };
    return { month: trendMonth, ...values, balance: values.income - values.expense };
  });

  const totals = totalsByType(summaryRows);
  return {
    month,
    summary: {
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense
    },
    trend,
    categoryBreakdown,
    incomeCategoryBreakdown,
    budgets,
    recentTransactions
  };
}
