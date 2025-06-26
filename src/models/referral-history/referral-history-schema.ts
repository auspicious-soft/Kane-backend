import mongoose from "mongoose";

const referralHistorySchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  referralCode: {
    type: String,
    required: false,
  },
  pointsAwardedToReferrer: {
    type: Number,
    default: 100,
  },
  pointsAwardedToReferred: {
    type: Number,
    default: 50,
  },
}, { timestamps: true });

export const referralHistoryModel = mongoose.model("ReferralHistory", referralHistorySchema);