import { Response } from "express";
import bcrypt from "bcryptjs";
import { Readable } from "stream";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";
import { usersModel } from "../../models/users/users-schema";
import { offersHistoryModel } from "./../../models/offers-history/offers-history-schema";
import { pointsHistoryModel } from "./../../models/points-history/points-history-schema";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { referralHistoryModel } from "../../models/referral-history/referral-history-schema";
import { createS3Client } from "../../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Get All Users
export const getAllUsersService = async (payload: any) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	// Get search query from queryBuilder
	let { query, sort } = queryBuilder(payload, ["fullName", "email", "firstName", "lastName"]);

	const totalUsers = await usersModel.countDocuments(query);
	const users = await usersModel.find(query).sort(sort).skip(offset).limit(limit).select("-password");

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

	let { query, sort } = queryBuilder(payload, [
    "fullName",
    "email",
    "firstName",
    "lastName",
  ]);

 
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
		history = await pointsHistoryModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).populate("restaurantId");
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

export const getCurrentUserService = async (userData: any, res: Response) => {
	const user = await usersModel.findById(userData.id).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User retrieved successfully",
		data: {user :user},
	};
};
export const getTopLeadersService = async (payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const totalTopLeaders = await usersModel.countDocuments({ isBlocked: false, isDeleted: false, topLeaderPrivacy: false, totalPoints: { $ne: 0 } })
	const topLeaders = await usersModel.find({ isBlocked: false, isDeleted: false, topLeaderPrivacy: false , totalPoints: { $ne: 0 }}).select("-password").sort({ totalPoints: -1 }).skip(offset).limit(limit);
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
	const pointsHistory = await pointsHistoryModel.find({ userId: userData.id }).populate({ path: "restaurantId", select: "" });
	return {
		success: true,
		message: "User points history retrieved successfully",
		data: {
			totalPoints: user.totalPoints,
			currency: user.currency,
			totalMoneyEarned: user.totalMoneyEarned,
			pointsHistory,
		},
	};
};
// Update User
export const updateUserService = async (id: string, payload: any,query: any, res: Response) => {
	const user = await usersModel.findById(id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	let updatedUser;
    if(query.type === "leaderPrivacy"){
		 updatedUser = await usersModel.findByIdAndUpdate(id, {topLeaderPrivacy:payload.topLeaderPrivacy}, { new: true }).select("-password");
	}
	else{
		updatedUser = await usersModel.findByIdAndUpdate(id, payload, { new: true }).select("-password");
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
		return errorResponseHandler("Old password does not match", httpStatusCode.CONFLICT, res);
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
			totalPoints: user.totalPoints,
			currency: user.currency,
			totalMoneyEarned: user.totalMoneyEarned,
			popularRestaurants,
			offersAvailable,
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
	} catch (error) {
		throw new Error(`Failed to update points and money: ${error.message}`);
	}
};

export const uploadStreamToS3Service = async (
  fileStream: Readable,
  fileName: string,
  fileType: string,
  userEmail: string
): Promise<string> => {
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