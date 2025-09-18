import mongoose, { Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const couponsHistorySchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    couponId:{
      type: Types.ObjectId,
      ref: "coupons",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["earn", "redeem"],
      required: true,
    },
    freeItem: {
      type: String,
      },
  },
  { timestamps: true }
);

export const couponsHistoryModel = mongoose.model("coupons_history", couponsHistorySchema);
