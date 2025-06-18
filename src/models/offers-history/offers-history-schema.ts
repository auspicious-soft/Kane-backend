import mongoose, { Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const offersHistorySchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    offerId:{
      type: Types.ObjectId,
      ref: "offer",
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

export const offersHistoryModel = mongoose.model("offers_history", offersHistorySchema);
