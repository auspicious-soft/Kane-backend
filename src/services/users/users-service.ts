import e, { Response } from "express";
import bcrypt from "bcryptjs";
import { Readable } from "stream";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder, spinPrizes } from "../../utils";
import { usersModel } from "../../models/users/users-schema";
import { offersHistoryModel } from "./../../models/offers-history/offers-history-schema";
import { pointsHistoryModel } from "./../../models/points-history/points-history-schema";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { referralHistoryModel } from "../../models/referral-history/referral-history-schema";
import { createS3Client } from "../../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createEposNowService } from "../epos/epos-service";
import { getUserAchievementHistoryService } from "../achievements-history/achievements-history-service";
import { getUserOfferHistoryForAdminService, getUserOfferHistoryForUserService, getUserOfferHistoryService } from "../offers-history/offers-history-service";
import { getUserCouponHistoryforAdminService, getUserCouponHistoryService, getUserRedeemCouponHistoryService } from "../coupons-history/coupons-history-service";
import { couponsHistoryModel } from "../../models/coupons-history/coupons-history-schema";
import { couponsModel } from "../../models/coupons/coupons-schema";
import { getUserVisitsService } from "../achievements/achievements-service";
import { sendNotification } from "../../utils/FCM/FCM";

const eposNowService = createEposNowService();
// Get All Users
export const getAllUsersService = async (payload: any) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	// Get search query from queryBuilder
	let { query } = queryBuilder(payload, ["fullName", "email", "firstName", "lastName"]);

	const totalUsers = await usersModel.countDocuments(query);
	const users = await usersModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).select("-password");

	return {
		success: true,
		message: "Users retrieved successfully",
		data: {
			users,
			page,
			limit,
			total: totalUsers,
		},
	};
};
export const getAllBlockedUsersService = async (payload: any) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	let { query, sort } = queryBuilder(payload, ["fullName", "email", "firstName", "lastName"]);

	const finalQuery = { ...query, isBlocked: true } as Record<string, any>;

	const totalUsers = await usersModel.countDocuments(finalQuery);
	const users = await usersModel
		.find({ isBlocked: true, ...query })
		.sort(sort)
		.skip(offset)
		.limit(limit)
		.select("-password");

	return {
		success: true,
		message: "Blocked users retrieved successfully",
		data: {
			users,
			page,
			limit,
			total: totalUsers,
		},
	};
};

// Get User by ID
export const getUserByIdService = async (id: string, res: Response) => {
	const user = await usersModel.findById(id).select("-password");
	//TODO add offer-history and points-history
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	return {
		success: true,
		message: "User retrieved successfully",
		data: user,
	};
};
export const getUserByBarcodeService = async (barcode: string, req: any, res: Response) => {
	const user = await usersModel.findOne({ identifier: barcode }).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	// const achievements: any = await getUserAchievementHistoryService(user?._id?.toString(), res);
	const offers: any = await getUserOfferHistoryForAdminService(user?._id?.toString(), req, res);
	const coupons: any = await getUserCouponHistoryforAdminService(user?._id?.toString(), req, res);

	return {
		success: true,
		message: "User retrieved successfully",
		data: {
			user,
			// achievements: achievements.data,
			offers: offers.data,
			coupons: coupons.data,
		},
	};
};
export const getUserHistoryService = async (id: string, payload: any, res: Response) => {
	const user = await usersModel.findById(id).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const query = { userId: id };
	let history;
	let totalHistory;
	if (payload.type === "points") {
		totalHistory = await pointsHistoryModel.countDocuments(query);
		history = await pointsHistoryModel
			.find({ ...query, type: "redeem" })
			.sort({ createdAt: -1 })
			.skip(offset)
			.limit(limit)
			.populate("restaurantId");
	} else if (payload.type === "offer") {
		totalHistory = await offersHistoryModel.countDocuments(query);
		history = await offersHistoryModel
			.find(query)
			.sort({ createdAt: -1 })
			.skip(offset)
			.limit(limit)
			.populate({
				path: "offerId",
				populate: [{ path: "restaurantId", select: { restaurantName: 1, image: 1 } }],
			});
	} else {
		totalHistory = await offersHistoryModel.countDocuments(query);
		history = await offersHistoryModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).populate("offerId");
	}
	return {
		success: true,
		message: "User retrieved successfully",
		data: {
			user,
			history,
			pagination: {
				page,
				limit,
				total: totalHistory,
			},
		},
	};
};
export const getUserHistoryForUserService = async (user: any, payload: any, res: Response) => {
	console.log("payload: ", payload);
	console.log("user: ", user);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const query = { userId: user.id };
	let history;
	let totalHistory;
	if (payload.type === "coupon") {
		history = await getUserRedeemCouponHistoryService(user, payload, res);
	} else if (payload.type === "offer") {
		history = await getUserOfferHistoryForUserService(user, payload, res);
	} else if (payload.type === "visit") {
		history = await getUserVisitsService(user, payload, res);
	}
	return {
		success: true,
		message: "User History retrieved successfully",
		data:{
			page,
			limit,
			total: totalHistory,
			data:history?.data,
		}
	};
};

export const getCurrentUserService = async (userData: any, res: Response) => {
	const user = await usersModel.findById(userData.id).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User retrieved successfully",
		data: { user: user },
	};
};
export const getTopLeadersService = async (payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const totalTopLeaders = await usersModel.countDocuments({ isBlocked: false, isDeleted: false, topLeaderPrivacy: false, totalPoints: { $ne: 0 } });
	const topLeaders = await usersModel
		.find({ isBlocked: false, isDeleted: false, topLeaderPrivacy: false, totalPoints: { $ne: 0 } })
		.select("-password")
		.sort({ totalPoints: -1 })
		.skip(offset)
		.limit(limit);
	return {
		success: true,
		message: "User retrieved successfully",
		data: {
			page,
			limit,
			total: totalTopLeaders,
			topLeaders,
		},
	};
};
export const getUserPointHistoryService = async (userData: any, res: Response) => {
	const user = await usersModel.findById(userData.id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const pointsHistory = (await pointsHistoryModel.find({ userId: userData.id }).sort({ createdAt: -1 }).populate({ path: "restaurantId", select: "" }));
	console.log('pointsHistory: ', pointsHistory);
	return {
		success: true,
		message: "User points history retrieved successfully",
		data: {
			totalPoints: user.activePoints,
			currency: user.currency,
			totalMoneyEarned: user.totalMoneyEarned,
			pointsHistory,
		},
	};
};
// Update User
export const updateUserService = async (id: string, payload: any, query: any, res: Response) => {
	const user = await usersModel.findById(id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	let updatedUser;
	if (query.type === "leaderPrivacy") {
		updatedUser = await usersModel.findByIdAndUpdate(id, { topLeaderPrivacy: payload.topLeaderPrivacy }, { new: true }).select("-password");
	} else {
		updatedUser = await usersModel.findByIdAndUpdate(id, payload, { new: true }).select("-password");
		if (updatedUser === null) {
			return {
				success: false,
				message: "User not found",
			};
		}
		const updatedCustomer = await eposNowService.updateData("Customer", [
			{
				Id: user.eposId,
				EmailAddress: updatedUser.email?.toString(),
				ContactNumber: updatedUser.phoneNumber?.toString(),
				Forename: updatedUser.fullName?.toString(),
				Title: updatedUser.gender === "male" ? 1 : 3,
				SignUpDate: updatedUser.createdAt,
			},
		]);
	}
	return {
		success: true,
		message: "User updated successfully",
		data: updatedUser,
	};
};

// Delete User
export const deleteUserService = async (id: string, res: Response) => {
	const user = await usersModel.findById(id);

	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	console.log("user.eposId: ", user.eposId);
	if (user.eposId) {
		const result = await eposNowService.deleteData("Customer", [
			{
				Id: parseInt(user.eposId, 10),
			},
		]);
	}
	await usersModel.findByIdAndUpdate(id, { isDeleted: true });

	return {
		success: true,
		message: "User deleted successfully",
	};
};

export const blockUserService = async (payload: any, res: Response) => {
	const user = await usersModel.findById(payload.id);

	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	await usersModel.findByIdAndUpdate(payload.id, { isBlocked: user.isBlocked ? false : true, reasonForBlock: user.isBlocked ? null : payload.reasonForBlock });

	return {
		success: true,
		message: `User ${user.isBlocked ? "unblocked" : "blocked"} successfully`,
	};
};

export const changePasswordService = async (userDetails: any, payload: any, res: Response) => {
	const { newPassword, oldPassword } = payload;
	const user = await usersModel.findById(userDetails.id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const isPasswordValid = await bcrypt.compare(oldPassword, user.password ?? "");
	if (isPasswordValid) {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await usersModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
	} else {
		return errorResponseHandler("Old password does not match", httpStatusCode.BAD_REQUEST, res);
	}
	return {
		success: true,
		message: `Password changed successfully`,
	};
};

export const homePageService = async (userDetails: any, payload: any, res: Response) => {
	const user = await usersModel.findById(userDetails.id);
	if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

	const popularRestaurants = await RestaurantsModel.find({ isDeleted: false }).limit(10);
	const offersAvailable = await RestaurantOffersModel.find().limit(10).populate("restaurantId");

	return {
		success: true,
		data: {
			userName: user.fullName,
			totalPoints: user.activePoints,
			currency: user.currency,
			totalMoneyEarned: user.totalMoneyEarned,
			popularRestaurants,
			offersAvailable,
			barCode: user.identifier,
			barCodeImg: user.barCode,
		},
	};
};
export const inviteCodeAndReferredDetailsService = async (userDetails: any, payload: any, res: Response) => {
	const user = await usersModel.findById(userDetails.id);
	if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	let invitedFriends: any[] = [];
	const referralCode = user.referralCode;
	const totalInvitedFriends = await referralHistoryModel.countDocuments({ referrer: userDetails.id });
	if (payload.type === "invited") {
		invitedFriends = await referralHistoryModel.find({ referrer: userDetails.id }).populate({ path: "referredUser", select: "fullName email profilePicture" });
	}
	return {
		success: true,
		data: {
			referralCode,
			totalInvitedFriends,
			invitedFriends,
		},
	};
};

export const updatePointsAndMoney = async (userId: any, valuePerPoint: any, totalPoints: any) => {
	try {
		// Validate input
		// if (!mongoose.Types.ObjectId.isValid(userId)) {
		//   throw new Error("Invalid user ID");
		// }
		// if (valuePerPoint == null || totalPoints == null) {
		//   throw new Error("valuePerPoint and totalPoints are required");
		// }
		// if (typeof valuePerPoint !== "number" || typeof totalPoints !== "number") {
		//   throw new Error("valuePerPoint and totalPoints must be numbers");
		// }
		// if (valuePerPoint < 0 || totalPoints < 0) {
		//   throw new Error("valuePerPoint and totalPoints cannot be negative");
		// }

		// Calculate totalMoneyEarned
		const totalMoneyEarned = valuePerPoint * totalPoints;

		// Update user document
		const updatedUser = await usersModel.findByIdAndUpdate(
			userId,
			{
				totalMoneyEarned,
				updatedAt: new Date(),
			},
			{ new: true, runValidators: true }
		);

		if (!updatedUser) {
			throw new Error("User not found");
		}

		return {
			_id: updatedUser._id,
			valuePerPoint: updatedUser.valuePerPoint,
			totalPoints: updatedUser.totalPoints,
			totalMoneyEarned: updatedUser.totalMoneyEarned,
		};
	} catch (error: any) {
		throw new Error(`Failed to update points and money: ${error.message}`);
	}
};

export const uploadStreamToS3Service = async (fileStream: Readable, fileName: string, fileType: string, userEmail: string): Promise<string> => {
	const timestamp = Date.now();
	const imageKey = `users/${userEmail}/images/${timestamp}-${fileName}`;

	// Convert stream to buffer
	const chunks: any[] = [];
	for await (const chunk of fileStream) {
		chunks.push(chunk);
	}
	const fileBuffer = Buffer.concat(chunks);

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: imageKey,
		Body: fileBuffer,
		ContentType: fileType,
	};

	const s3Client = createS3Client();
	const command = new PutObjectCommand(params);
	await s3Client.send(command);

	return imageKey;
};

export const getSpinPrizesService = async (userData: any, payload: any, res: Response) => {
	const user = await usersModel.findById(userData.id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	if (user.spin <= 0) {
		return errorResponseHandler("No spins available", httpStatusCode.BAD_REQUEST, res);
	}
	//TODO: user pont history add
	if (payload.type === "points") {
		if (payload.prize === "200 points") {
			user.totalPoints += 200;
			user.activePoints += 200;
			await updatePointsAndMoney(user._id, user.valuePerPoint, user.totalPoints);
            await pointsHistoryModel.create({ pointsFrom: "SPIN", title: `You won ${payload.prize} from spin.`, userId: user._id, points: 200, type: "earn" });
			await user.save();
		} else if (payload.prize === "10 points") {
			user.totalPoints += 10;
			user.activePoints += 10;
			await updatePointsAndMoney(user._id, user.valuePerPoint, user.totalPoints);
			await pointsHistoryModel.create({ pointsFrom: "SPIN", title: `You won ${payload.prize} from spin.`, userId: user._id, points: 10, type: "earn" });

			await user.save();
		} else if (payload.prize === "50 points") {
			user.totalPoints += 50;
			user.activePoints += 50;
			await updatePointsAndMoney(user._id, user.valuePerPoint, user.totalPoints);            
			await pointsHistoryModel.create({ pointsFrom: "SPIN", title: `You won ${payload.prize} from spin.`, userId: user._id, points: 50, type: "earn" });

			await user.save();
		} else if (payload.prize === "100 points") {
			user.totalPoints += 100;
			user.activePoints += 100;
			await updatePointsAndMoney(user._id, user.valuePerPoint, user.totalPoints);
			await pointsHistoryModel.create({ pointsFrom: "SPIN", title: `You won ${payload.prize} from spin.`, userId: user._id, points: 100, type: "earn" });
			await sendNotification({ userIds: [user._id], type: "Won_Reward"});
			await user.save();
		} else if (payload.prize === "150 points") {
			user.totalPoints += 150;
			user.activePoints += 150;
			await updatePointsAndMoney(user._id, user.valuePerPoint, user.totalPoints);
			await pointsHistoryModel.create({ pointsFrom: "SPIN", title: `You won ${payload.prize} from spin.`, userId: user._id, points: 150, type: "earn" });
			await sendNotification({ userIds: [user._id], type: "Won_Reward"});
			await user.save();
		}
	} else if (payload.type === "coupon") {
		// Step 1: Fetch all active & valid coupons
		const couponCodes = await couponsModel
			.find({
				isActive: true,
				expiry: { $gt: new Date() },
			})
			.lean();

		// Step 2: Get user's redeemed coupon history
		const couponHistory = await couponsHistoryModel
			.find({
				userId: user._id,
				// type: "redeem",
			})
			.lean();

		// Step 3: Extract redeemed coupon IDs
		const redeemedIds = couponHistory.map((h) => h.couponId.toString());

		// Step 4: Filter out redeemed coupons
		const availableCoupons = couponCodes.filter((coupon) => !redeemedIds.includes(coupon._id.toString()));

		// Step 5: Randomly select one
		let selectedCoupon = null;
		if (availableCoupons.length > 0) {
			const randomIndex = Math.floor(Math.random() * availableCoupons.length);
			selectedCoupon = availableCoupons[randomIndex];
			console.log("selectedCoupon: ", selectedCoupon);
			await couponsHistoryModel.create({ userId: user._id, couponId: selectedCoupon._id, type: "earn" });
			await sendNotification({ userIds: [user._id], type: "Won_Reward"});
		}

		// 👉 selectedCoupon will be either a coupon object or null if none available
	} else if (payload.type === "message") {
		// No action needed for message type
	}
	if (payload.type !== "message" && payload.prize !== "Better luck next time") {
	}
	user.spin = user.spin - 1;
	await user.save();
	return {
		success: true,
		message: "Spin prize processed successfully",
	};
};

export const getAllSpinPrizesListService = async (user: any, res: Response) => {
	const freeSpin: any = await usersModel.findOne({ _id: user.id });
	return {
		success: true,
		data: {	
			freeSpin: freeSpin.spin || 0,
			spinPrizes,
		},
	};
};
