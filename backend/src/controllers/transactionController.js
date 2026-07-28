import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { getDayRange, getMonthRange, parseDate } from "../utils/date.js";
import { cleanText, escapeRegex } from "../utils/text.js";
import { findOwnedCategory, assertCategoryType } from "../services/categoryService.js";
import { getBudgetAlertForTransaction } from "../services/budgetService.js";
import { rowsToCsv } from "../utils/csv.js";

function positiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "amount must be a positive number");
  }
  return amount;
}

function categoryIdFrom(body = {}) {
  if (body.category !== undefined && body.categoryId !== undefined && String(body.category) !== String(body.categoryId)) {
    throw new ApiError(400, "category and categoryId must match when both are provided");
  }
  return body.category ?? body.categoryId;
}

function readTransactionInput(body = {}, { isCreate = false } = {}) {
  const input = {};

  if (isCreate || body.title !== undefined) {
    const title = cleanText(body.title);
    if (!title) throw new ApiError(400, "title is required");
    if (title.length > 120) throw new ApiError(400, "title must be 120 characters or fewer");
    input.title = title;
  }

  if (isCreate || body.amount !== undefined) input.amount = positiveAmount(body.amount);
  if (isCreate || body.type !== undefined) input.type = assertCategoryType(body.type);
  const categoryId = categoryIdFrom(body);
  if (isCreate || categoryId !== undefined) input.category = categoryId;
  if (body.date !== undefined) {
    if (!body.date) throw new ApiError(400, "date is required");
    input.date = parseDate(body.date);
  } else if (isCreate) {
    input.date = new Date();
  }

  if (body.note !== undefined) {
    const note = cleanText(body.note);
    if (note.length > 500) throw new ApiError(400, "note must be 500 characters or fewer");
    input.note = note;
  }

  return input;
}

async function validateTransactionCategory(userId, input, currentTransaction) {
  const categoryId = input.category || currentTransaction?.category;
  const type = input.type || currentTransaction?.type;
  const isExistingCategory = currentTransaction && String(categoryId) === String(currentTransaction.category);
  const category = await findOwnedCategory(userId, categoryId, { includeArchived: isExistingCategory });

  if (category.type !== type) {
    throw new ApiError(400, `${type} transactions must use an ${type} category`);
  }

  return category;
}

function listFilter(userId, query) {
  const filter = { user: userId };
  if (query.type) filter.type = assertCategoryType(query.type);

  if (query.category) {
    if (!mongoose.isValidObjectId(query.category)) throw new ApiError(400, "Invalid category id");
    filter.category = query.category;
  }

  if (query.date) {
    const { start, end } = getDayRange(query.date);
    filter.date = { $gte: start, $lt: end };
  } else if (query.month) {
    const { start, end } = getMonthRange(query.month);
    filter.date = { $gte: start, $lt: end };
  } else if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = parseDate(query.from, "from");
    if (query.to) {
      const to = parseDate(query.to, "to");
      to.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = to;
    }
  }

  if (query.search) {
    filter.title = { $regex: escapeRegex(cleanText(query.search)), $options: "i" };
  }
  return filter;
}

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 50));
  return { page, limit, skip: (page - 1) * limit };
}

export const listTransactions = asyncHandler(async (req, res) => {
  const filter = listFilter(req.user._id, req.query);
  const { page, limit, skip } = pagination(req.query);
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("category", "name color icon type isArchived")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const input = readTransactionInput(req.body, { isCreate: true });
  const category = await validateTransactionCategory(req.user._id, input);
  const transaction = await Transaction.create({ user: req.user._id, ...input });
  const budgetAlert = await getBudgetAlertForTransaction(transaction, category);
  await transaction.populate("category", "name color icon type isArchived");

  res.status(201).json({ success: true, data: { transaction, budgetAlert } });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid transaction id");
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) throw new ApiError(404, "Transaction not found");

  const input = readTransactionInput(req.body);
  const category = await validateTransactionCategory(req.user._id, input, transaction);
  Object.assign(transaction, input);
  await transaction.save();

  const budgetAlert = await getBudgetAlertForTransaction(transaction, category);
  await transaction.populate("category", "name color icon type isArchived");
  res.json({ success: true, data: { transaction, budgetAlert } });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid transaction id");
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!transaction) throw new ApiError(404, "Transaction not found");
  res.json({ success: true, data: { transaction } });
});

export const exportMonthlyExpenses = asyncHandler(async (req, res) => {
  const { month, start, end } = getMonthRange(req.query.month);
  const transactions = await Transaction.find({
    user: req.user._id,
    type: "expense",
    date: { $gte: start, $lt: end }
  })
    .populate("category", "name")
    .sort({ date: 1, createdAt: 1 })
    .lean();

  const rows = [
    ["Date", "Title", "Category", "Amount", "Note"],
    ...transactions.map((transaction) => [
      transaction.date.toISOString().slice(0, 10),
      transaction.title,
      transaction.category?.name || "Archived category",
      transaction.amount,
      transaction.note || ""
    ])
  ];

  res.type("text/csv");
  res.attachment(`expenses-${month}.csv`);
  res.send(`\uFEFF${rowsToCsv(rows)}`);
});
