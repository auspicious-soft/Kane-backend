import mongoose, { Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const achievementsHistorySchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    achievementId:{
      type: Types.ObjectId,
      ref: "achievements",
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
  },
  { timestamps: true }
);

export const achievementsHistoryModel = mongoose.model("achievements_history", achievementsHistorySchema);
