import mongoose, { Types } from "mongoose";
import { customAlphabet } from "nanoid";
const identifier = customAlphabet("0123456789", 5);

const achievementsSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			unique: true,
			default: () => identifier(),
		},
		achievementName: {
			type: String,
			default: null,
		},
		description: {
			type: String,
			default: null,
		},
		stamps: {
			type: Number,
			default: null,
		},
		rewardValue: {
			type: Number,
			default: null,
		},
		assignRestaurant: {
			type: Types.ObjectId,
			ref: "restaurant",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export const achievementsModel = mongoose.model("achievements", achievementsSchema);