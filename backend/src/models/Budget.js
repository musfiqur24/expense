import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "month must use the YYYY-MM format"]
    },
    amount: {
      type: Number,
      required: true,
      min: [Number.MIN_VALUE, "amount must be greater than zero"]
    }
  },
  { timestamps: true }
);

// `amount` is the canonical stored field; `limit` keeps the client-facing budget vocabulary ergonomic.
budgetSchema.virtual("limit").get(function getLimit() {
  return this.amount;
});
budgetSchema.set("toJSON", { virtuals: true });
budgetSchema.set("toObject", { virtuals: true });

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });
budgetSchema.index({ user: 1, month: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
