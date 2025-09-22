import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { offersHistoryModel } from "../../models/offers-history/offers-history-schema";
import { usersModel } from "../../models/users/users-schema";
import { achievementsHistoryModel } from "../../models/achievement-history/achievement-history-schema";
import { achievementsModel } from "../../models/achievements/achievements-schema";

export const createAchievementsHistoryService = async (payload: any, res: Response) => {
	const { userId, achievementId, type } = payload;
	if (!userId || !achievementId || !type || !["earn", "redeem"].includes(type)) {
		return errorResponseHandler("All achievement history fields are required", httpStatusCode.BAD_REQUEST, res);
	}
	const achievementHistory = await achievementsHistoryModel.create({
		userId,
		achievementId,
		type,
	});
	if (!achievementHistory) {
		return errorResponseHandler("Failed to create achievement history", httpStatusCode.INTERNAL_SERVER_ERROR, res);
	}
	const userData = await usersModel.findById(userId);

	if (!userData) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	const achievement = await achievementsModel.findById(achievementId);
	const restaurant = achievement ? achievement.assignRestaurant : null;
	if (!achievement) {
		return errorResponseHandler("Achievement not found", httpStatusCode.NOT_FOUND, res);
	}
	if (!restaurant) {
		return errorResponseHandler("Assigned restaurant not found for this achievement", httpStatusCode.NOT_FOUND, res);
	}
	const existingVisitIndex = userData.visitData.findIndex((visit: any) => visit.restaurantId.toString() === restaurant.toString());
	// userData.visitData[existingVisitIndex].totalVisits += 1;
	userData.visitData[existingVisitIndex].currentVisitStreak = 0;

  await userData.save();
	return {
		success: true,
		message: "Achievement history created successfully",
		data: achievementHistory,
	};
};

export const getAllAchievementHistoriesService = async (res: Response) => {
	const achievementHistories = await achievementsHistoryModel.find({});
	return {
		success: true,
		message: "Achievement histories retrieved successfully",
		data: achievementHistories,
	};
};

export const getAchievementHistoryByIdService = async (historyId: string, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Achievement history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const achievementHistory = await achievementsHistoryModel.findById(historyId);

	if (!achievementHistory) {
		return errorResponseHandler("Achievement history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Achievement history retrieved successfully",
		data: achievementHistory,
	};
};

export const updateAchievementHistoryService = async (historyId: string, payload: any, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Achievement history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const updatedAchievementHistory = await achievementsHistoryModel.findByIdAndUpdate(historyId, { ...payload }, { new: true });

	if (!updatedAchievementHistory) {
		return errorResponseHandler("Achievement history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Achievement history updated successfully",
		data: updatedAchievementHistory,
	};
};

export const deleteAchievementHistoryService = async (historyId: string, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Achievement history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const deletedAchievementHistory = await achievementsHistoryModel.findByIdAndDelete(historyId);

	if (!deletedAchievementHistory) {
		return errorResponseHandler("Achievement history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Achievement history deleted successfully",
		data: deletedAchievementHistory,
	};
};
export const getUserAchievementHistoryService = async (userId: string, res: Response) => {
	if (!userId) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userAchievementHistory = await achievementsHistoryModel.find({ userId }).populate("achievementId");

	if (!userAchievementHistory) {
		return errorResponseHandler("No achievement history found for this user", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User achievement history retrieved successfully",
		data: userAchievementHistory,
	};
};

export const postApplyUserAchievementService = async (payload: any, res: Response) => {
	const { userId, achievementId } = payload;
	console.log("payload: ", payload);
	let pointsTobeRedeemed = 0;
	if (!userId) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userAchievementHistory = await achievementsHistoryModel.find({ userId, achievementId }).populate("achievementId").lean();
	console.log("userAchievementHistory: ", userAchievementHistory);
	if (!userAchievementHistory || userAchievementHistory.length === 0) {
		return errorResponseHandler("No achievement history found for this user", httpStatusCode.NOT_FOUND, res);
	}

	if (userAchievementHistory.some((history) => (history.achievementId as any)?.expiry < new Date())) {
		return errorResponseHandler("Achievement is expired", httpStatusCode.BAD_REQUEST, res);
	}

	if (payload.pointsWorth) {
		pointsTobeRedeemed = payload.pointsWorth;
	} else {
		pointsTobeRedeemed = userAchievementHistory.reduce((acc, curr) => {
			if (curr.type === "earn") {
				return acc + (curr.achievementId as any).points;
			}
			return acc;
		}, 0);
	}
	console.log("pointsTobeRedeemed: ", pointsTobeRedeemed);
	const updateUserPointsToBeRedeemed = await usersModel.updateOne(
		{ _id: userId },
		{
			$inc: { activePoints: pointsTobeRedeemed },
		}
	);
	const userData = await usersModel.findById(userId);
	if (!userData) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	// await updatePointsAndMoney(userId, userData.valuePerPoint, userData.totalPoints,);
	if (!updateUserPointsToBeRedeemed) {
		return errorResponseHandler("Failed to update user points", httpStatusCode.INTERNAL_SERVER_ERROR, res);
	}
	await achievementsHistoryModel.create({ userId, achievementId, type: "redeem" });

	return {
		success: true,
		message: "User achievement history retrieved successfully",
		data: userAchievementHistory,
	};
};


