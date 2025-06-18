import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const referralCode = customAlphabet(alphabet, 8);

const referralsSchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    referralCode: {
      type: String,
      unique: true,
      default: () => referralCode(),
      required: true,
    }, 
    codeCreatedBy: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      },
    codeUsedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }],
  },
  { timestamps: true }
);

export const referralsModel = mongoose.model("referral", referralsSchema);