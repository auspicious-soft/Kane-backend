import mongoose, { Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const pointsHistorySchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    restaurantId:{
      type: Types.ObjectId,
      ref: "restaurant",
    },
    orderDetails: {
      type: String,
      required: false,
      trim: true,
    },
    pointsFrom:{
      type: String,
      enum:["REFERRAL_TO","USED_REFERRAL_CODE","SPIN","STAMPS"]
    },
    title:{
      type:String,
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    points: {
      type: Number,
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

export const pointsHistoryModel = mongoose.model("points_history", pointsHistorySchema);
