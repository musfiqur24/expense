import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { assertMonth, currentMonth } from "../utils/date.js";
import { findOwnedCategory } from "../services/categoryService.js";
import { getBudgetProgress } from "../services/budgetService.js";

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

async function validateExpenseCategory(userId, categoryId) {
  const category = await findOwnedCategory(userId, categoryId);
  if (category.type !== "expense") {
    throw new ApiError(400, "A budget can only be created for an expense category");
  }
  return category;
}

function budgetInput(body = {}, { isCreate = false } = {}) {
  const input = {};
  const categoryId = categoryIdFrom(body);
  if (isCreate || categoryId !== undefined) input.category = categoryId;
  if (isCreate || body.month !== undefined) input.month = assertMonth(body.month);
  if (body.amount !== undefined && body.limit !== undefined && Number(body.amount) !== Number(body.limit)) {
    throw new ApiError(400, "amount and limit must match when both are provided");
  }
  const amount = body.amount ?? body.limit;
  if (isCreate || amount !== undefined) input.amount = positiveAmount(amount);
  return input;
}

export const listBudgets = asyncHandler(async (req, res) => {
  const month = req.query.month ? assertMonth(req.query.month) : currentMonth();
  const budgets = await getBudgetProgress(req.user._id, month);
  res.json({ success: true, data: { month, budgets } });
});

export const createBudget = asyncHandler(async (req, res) => {
  const input = budgetInput(req.body, { isCreate: true });
  await validateExpenseCategory(req.user._id, input.category);
  const budget = await Budget.create({ user: req.user._id, ...input });
  await budget.populate("category", "name color icon type isArchived");
  res.status(201).json({ success: true, data: { budget } });
});

export const updateBudget = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid budget id");
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) throw new ApiError(404, "Budget not found");

  const input = budgetInput(req.body);
  if (input.category) await validateExpenseCategory(req.user._id, input.category);
  Object.assign(budget, input);
  await budget.save();
  await budget.populate("category", "name color icon type isArchived");

  res.json({ success: true, data: { budget } });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid budget id");
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) throw new ApiError(404, "Budget not found");
  res.json({ success: true, data: { budget } });
});
