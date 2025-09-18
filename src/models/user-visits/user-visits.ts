import mongoose, { Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);

const userVisitsSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			unique: true,
			default: () => identifier(),
		},
		restaurantId: {
			type: Types.ObjectId,
			ref: "restaurant",
		}, 
        userId: {
            type: Types.ObjectId,
            ref: "user",
        },
	},
	{ timestamps: true }
);

export const UserVisitsModel = mongoose.model("user-visits", userVisitsSchema);
