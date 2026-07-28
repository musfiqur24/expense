import mongoose from "mongoose";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { categoryNameKey } from "../utils/text.js";

const DEFAULT_CATEGORIES = [
  { type: "expense", name: "Food", color: "#F97316", icon: "utensils" },
  { type: "expense", name: "Transport", color: "#3B82F6", icon: "car" },
  { type: "expense", name: "Housing", color: "#8B5CF6", icon: "home" },
  { type: "expense", name: "Utilities", color: "#06B6D4", icon: "bolt" },
  { type: "expense", name: "Health", color: "#EF4444", icon: "heart-pulse" },
  { type: "expense", name: "Shopping", color: "#EC4899", icon: "shopping-bag" },
  { type: "expense", name: "Entertainment", color: "#A855F7", icon: "party-popper" },
  { type: "expense", name: "Education", color: "#14B8A6", icon: "graduation-cap" },
  { type: "expense", name: "Travel", color: "#0EA5E9", icon: "plane" },
  { type: "expense", name: "Other", color: "#64748B", icon: "ellipsis" },
  { type: "income", name: "Salary", color: "#16A34A", icon: "briefcase-business" },
  { type: "income", name: "Freelance", color: "#22C55E", icon: "laptop" },
  { type: "income", name: "Business", color: "#84CC16", icon: "store" },
  { type: "income", name: "Investment", color: "#10B981", icon: "chart-no-axes-combined" },
  { type: "income", name: "Gift", color: "#EAB308", icon: "gift" },
  { type: "income", name: "Other", color: "#64748B", icon: "ellipsis" }
];

export async function seedDefaultCategories(userId) {
  const user = new mongoose.Types.ObjectId(userId);
  await Category.bulkWrite(
    DEFAULT_CATEGORIES.map((category) => ({
      updateOne: {
        filter: {
          user,
          type: category.type,
          nameKey: categoryNameKey(category.name),
          isArchived: false
        },
        update: {
          $setOnInsert: {
            ...category,
            user,
            nameKey: categoryNameKey(category.name),
            isDefault: true,
            isArchived: false
          }
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
}

export function assertCategoryType(type) {
  if (!["income", "expense"].includes(type)) {
    throw new ApiError(400, "type must be either income or expense");
  }
  return type;
}

export async function findOwnedCategory(userId, categoryId, { includeArchived = false } = {}) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, "Invalid category id");
  }

  const filter = { _id: categoryId, user: userId };
  if (!includeArchived) filter.isArchived = false;

  const category = await Category.findOne(filter);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
}
