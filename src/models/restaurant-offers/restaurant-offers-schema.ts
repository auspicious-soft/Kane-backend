import mongoose, { Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const restaurantOffersSchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    restaurantId:{
      type: Types.ObjectId,
      ref: "restaurant",
    },
    offerName: {
      type: String,
      required: false,
      trim: true,
    },
    image:{
      type: String,
      required: false, //TODO: make it required
    },
    description: {
      type: String,
      required: true,
    },
    visits:{
      type:Number,
      required: true
    },
    redeemInStore: {
      type: String,
      required: true,
    },
    unlockRewards: {
      type: String,
      required: true,
    },
    isActive:{
      type:Boolean,
      default:true
    },
    points:{
      type:Number,
      default:0
    },
  },
  { timestamps: true }
);

export const RestaurantOffersModel = mongoose.model("restaurant_offer", restaurantOffersSchema);
