import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    amount: {
      type: Number,
      required: true,
      min: [Number.MIN_VALUE, "amount must be greater than zero"]
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, type: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
