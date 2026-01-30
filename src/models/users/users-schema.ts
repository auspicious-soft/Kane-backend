import mongoose, { Types } from "mongoose";
import { customAlphabet } from "nanoid";

const identifier = customAlphabet("0123456789", 5);
export const referalCodeGenerator = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFCGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

const userSchema = new mongoose.Schema(
	{
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
		},
		profilePic: {
			type: String,
		},
		gender: {
			type: String,
		},
		referralCode: {
			type: String,
			unique: true,
			default: () => referalCodeGenerator(),
		},
		referredBy: {
			type: Types.ObjectId,
			ref: "user",
		},
		password: {
			type: String,
			require: true,
		},
		totalPoints: {
			type: Number,
			default: 0,
		},
		redeemedPoints: {
			type: Number,
			default: 0,
		},
		activePoints: {
			type: Number,
			default: 0,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		reasonForBlock: {
			type: String,
			required: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		profilePicture: {
			type: String,
			default: null,
		},
		totalMoneyEarned: {
			type: Number,
			default: 0,
		},
		currency: {
			type: String,
			// default: "£",
		},
		valuePerPoint: {
			type: Number,
			default: 1,
		},
		topLeaderPrivacy: {
			type: Boolean,
			default: false,
		},
		barCode: {
			type: String,
			default: null,
		},
		eposId: {
			type: String,
			default: null,
		},
		visitData: {
			type: [
				{
					totalVisits: {
						type: Number,
						default: 0,
					},
					restaurantId: {
						type: Types.ObjectId,
						ref: "restaurant",
					},
					currentVisitStreak: {
						type: Number,
						default: 0,
					},
				},
			],
			default: [],
		},
		notificationAllowed: {
			type: Boolean,
			default: true,
		},
		spin: {
			type: Number,
			default: 0,
		},
		totalStampsCollected: {
			type: Number,
			default: 0
		}
	},
	{ timestamps: true }
);

export const usersModel = mongoose.model("user", userSchema);
