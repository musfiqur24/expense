import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    givenName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    familyName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: ""
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: "USD"
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: 64,
      default: "UTC"
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
