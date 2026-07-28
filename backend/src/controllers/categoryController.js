import Category from "../models/Category.js";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { categoryNameKey, cleanText } from "../utils/text.js";
import { assertCategoryType, findOwnedCategory } from "../services/categoryService.js";

function readCategoryInput(body = {}, { isCreate = false } = {}) {
  const input = {};

  if (isCreate || body.type !== undefined) input.type = assertCategoryType(body.type);

  if (isCreate || body.name !== undefined) {
    const name = cleanText(body.name);
    if (!name) throw new ApiError(400, "name is required");
    if (name.length > 40) throw new ApiError(400, "name must be 40 characters or fewer");
    input.name = name;
    input.nameKey = categoryNameKey(name);
  }

  if (body.color !== undefined) {
    const color = cleanText(body.color).toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(color)) {
      throw new ApiError(400, "color must be a six-digit hex color");
    }
    input.color = color;
  }

  if (body.icon !== undefined) {
    const icon = cleanText(body.icon);
    if (icon.length > 40) throw new ApiError(400, "icon must be 40 characters or fewer");
    input.icon = icon || "tag";
  }

  return input;
}

export const listCategories = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.type) filter.type = assertCategoryType(req.query.type);
  if (req.query.includeArchived !== "true") filter.isArchived = false;

  const categories = await Category.find(filter).sort({ type: 1, name: 1 }).lean();
  res.json({ success: true, data: { categories } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    user: req.user._id,
    ...readCategoryInput(req.body, { isCreate: true })
  });
  res.status(201).json({ success: true, data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await findOwnedCategory(req.user._id, req.params.id, { includeArchived: true });
  const input = readCategoryInput(req.body);

  // A category's type is immutable: changing it would invalidate historic transactions.
  if (input.type && input.type !== category.type) {
    throw new ApiError(400, "A category type cannot be changed after creation");
  }
  delete input.type;
  Object.assign(category, input);
  await category.save();

  res.json({ success: true, data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await findOwnedCategory(req.user._id, req.params.id, { includeArchived: true });
  const [transactionCount, budgetCount] = await Promise.all([
    Transaction.countDocuments({ user: req.user._id, category: category._id }),
    Budget.countDocuments({ user: req.user._id, category: category._id })
  ]);

  if (transactionCount || budgetCount) {
    category.isArchived = true;
    await category.save();
    return res.json({
      success: true,
      data: { category, archived: true },
      message: "Category was archived to preserve its history"
    });
  }

  await category.deleteOne();
  return res.json({ success: true, data: { category, archived: false } });
});
