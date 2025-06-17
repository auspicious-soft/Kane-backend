import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const restaurantsSchema = new mongoose.Schema({
    identifier: {
      type: String,
      unique: true,
      default: () => identifier(),
    },
    restaurantName: {
      type: String,
      required: false,
      trim: true,
    },
    image:{
      type: String,
      required: false, //TODO: make it required
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export const RestaurantsModel = mongoose.model("restaurant", restaurantsSchema);
