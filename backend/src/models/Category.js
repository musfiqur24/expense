import mongoose from "mongoose";
import { categoryNameKey } from "../utils/text.js";

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    nameKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    color: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^#[0-9A-F]{6}$/, "color must be a six-digit hex color"],
      default: "#64748B"
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "tag"
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

categorySchema.pre("validate", function setNameKey(next) {
  if (this.name) this.nameKey = categoryNameKey(this.name);
  next();
});

categorySchema.index(
  { user: 1, type: 1, nameKey: 1 },
  {
    unique: true,
    partialFilterExpression: { isArchived: false }
  }
);
categorySchema.index({ user: 1, type: 1, isArchived: 1, name: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
