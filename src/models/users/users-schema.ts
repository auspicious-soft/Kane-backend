import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const userSchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    role: {
      type: String,
      default: "user",
      required: true,
    },
    fullName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    countryCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    gender: {
      type: String
    },
    referalCode:{
      type:String,
      default: null
    },
    password:{
      type: String,
      require:true
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    redeemedPoints: {
      type: Number,
      default: 0
    },
    activePoints: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export const usersModel = mongoose.model("user", userSchema);
