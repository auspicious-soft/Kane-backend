import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { couponsHistoryModel } from "../../models/coupons-history/coupons-history-schema";
import { usersModel } from "../../models/users/users-schema";
import { updatePointsAndMoney } from "../users/users-service";

interface CouponHistory {
	type: "earn" | "redeem";
	couponId: {
		points: number;
		expiry: Date;
	};
	userId: string;
	freeItem: string;
}

export const createCouponsHistoryService = async (payload: any, res: Response) => {
	const { userId, couponId, type, freeItem } = payload;
	if (!userId || !couponId || !type || !["earn", "redeem"].includes(type)) {
		return errorResponseHandler("All coupon history fields are required", httpStatusCode.BAD_REQUEST, res);
	}
	const couponHistory = await couponsHistoryModel.create({
		userId,
		couponId,
		type,
		freeItem,
	});
	if (!couponHistory) {
		return errorResponseHandler("Failed to create coupon history", httpStatusCode.INTERNAL_SERVER_ERROR, res);
	}
	return {
		success: true,
		message: "Coupon history created successfully",
		data: couponHistory,
	};
};

export const getAllCouponHistoriesService = async (res: Response) => {
	const couponHistories = await couponsHistoryModel.find({});
	return {
		success: true,
		message: "Coupon histories retrieved successfully",
		data: couponHistories,
	};
};

export const getCouponHistoryByIdService = async (historyId: string, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Coupon history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const couponHistory = await couponsHistoryModel.findById(historyId);

	if (!couponHistory) {
		return errorResponseHandler("Coupon history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupon history retrieved successfully",
		data: couponHistory,
	};
};

export const updateCouponHistoryService = async (historyId: string, payload: any, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Coupon history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const updatedCouponHistory = await couponsHistoryModel.findByIdAndUpdate(historyId, { ...payload }, { new: true });

	if (!updatedCouponHistory) {
		return errorResponseHandler("Coupon history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupon history updated successfully",
		data: updatedCouponHistory,
	};
};

export const deleteCouponHistoryService = async (historyId: string, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Coupon history ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const deletedCouponHistory = await couponsHistoryModel.findByIdAndDelete(historyId);

	if (!deletedCouponHistory) {
		return errorResponseHandler("Coupon history not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupon history deleted successfully",
		data: deletedCouponHistory,
	};
};
export const getUserCouponHistoryService = async (userId: string, res: Response) => {
	if (!userId) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userCouponHistory = await couponsHistoryModel.find({ userId, type: "earn" }).populate("couponId");

	if (!userCouponHistory) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User coupon history retrieved successfully",
		data: userCouponHistory,
	};
};
export const postApplyUserCouponService = async (payload: any, res: Response) => {
	const { userId, couponId } = payload;
	console.log('payload: ', payload);
	let pointsTobeRedeemed = 0;
	if (!userId) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userCouponHistory = await couponsHistoryModel.find({ userId, couponId }).populate("couponId").lean();
	console.log("userCouponHistory: ", userCouponHistory);
	if (!userCouponHistory || userCouponHistory.length === 0) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}
	
	if (userCouponHistory.some((history) => (history.couponId as any)?.expiry < new Date())) {
		return errorResponseHandler("Coupon is expired", httpStatusCode.BAD_REQUEST, res);
	}
	
	if (payload.pointsWorth) {
		pointsTobeRedeemed = payload.pointsWorth;
	} else {
		pointsTobeRedeemed = userCouponHistory.reduce((acc, curr) => {
		if (curr.type === "earn") {
			return acc + (curr.couponId as any).points;
		}
		return acc;
	}, 0);
	}
	console.log('pointsTobeRedeemed: ', pointsTobeRedeemed);
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
	await couponsHistoryModel.create({ userId, couponId, type: "redeem" });

	return {
		success: true,
		message: "User coupon history retrieved successfully",
		data: userCouponHistory,
	};
};
