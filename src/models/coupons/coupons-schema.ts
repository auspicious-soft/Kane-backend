import { Type } from "@aws-sdk/client-s3";
import mongoose, { Types } from "mongoose";
import { customAlphabet } from "nanoid";
const identifier = customAlphabet("0123456789", 5);

const couponsSchema = new mongoose.Schema(
	{
		identifier: {
			type: String,
			unique: true,
			default: () => identifier(),
		},
		offerName: {
			type: Types.ObjectId,
			ref: "restaurant_offer",
		},
		couponName: {
			type: String,
			// required: true
		},
		description: {
			type: String,
			// required: true
		},
		percentage: {
			type: Number,
			default: null,
		},
		points: {
			type: Number,
			default: null,
		},
		type:{
			type:String,
			enum:["offer","points","percentage"],
			default:null,
			required:true,
		},
		expiry: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		

	},
	{ timestamps: true }
);

export const couponsModel = mongoose.model("coupons", couponsSchema);