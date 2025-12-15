import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { couponsHistoryModel } from "../../models/coupons-history/coupons-history-schema";
import { usersModel } from "../../models/users/users-schema";
import { updatePointsAndMoney } from "../users/users-service";
import path from "path";
import { pointsHistoryModel } from "../../models/points-history/points-history-schema";

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
export const getUserRedeemCouponHistoryService = async (user: any, payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	if (!user.id) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userCouponHistory = await couponsHistoryModel.find({ userId: user.id, type: "redeem" }).skip(offset).limit(limit).populate("couponId");
	const total = await couponsHistoryModel.countDocuments({ userId: user.id, type: "redeem" });
	if (!userCouponHistory) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User coupon history retrieved successfully",
		data: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			data: userCouponHistory
		}
	};
};

// export const updateCouponStatusService = async (historyId: string, res: Response) => {
// 	if (!historyId) {
// 		return errorResponseHandler("Coupon history ID is required", httpStatusCode.BAD_REQUEST, res);
// 	}
// 	const updatedCouponHistory = await couponsHistoryModel.findByIdAndUpdate(historyId, { isScratched: true }, { new: true });

// 	if (!updatedCouponHistory) {
// 		return errorResponseHandler("Coupon history not found", httpStatusCode.NOT_FOUND, res);
// 	}
// 	return {
// 		success: true,
// 		message: "Coupon history updated successfully",
// 		data: updatedCouponHistory,
// 	};
// };


export const updateCouponStatusService = async (historyId: string, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Coupon history ID is required", httpStatusCode.BAD_REQUEST, res);
	}

	// Find and update the coupon history to scratched
	const updatedCouponHistory:any = await couponsHistoryModel
		.findByIdAndUpdate(historyId, { isScratched: true }, { new: true })
		.populate("couponId"); // populate coupon details

	if (!updatedCouponHistory) {
		return errorResponseHandler("Coupon history not found", httpStatusCode.NOT_FOUND, res);
	}

	// If the coupon type is 'points', create a userPointHistory record
	if (updatedCouponHistory.couponId?.type === "points") {
		const points = updatedCouponHistory.couponId.points || 0;
		await pointsHistoryModel.create({ pointsFrom: "Coupon", title: `Earned points from coupon ${updatedCouponHistory.couponId?.couponName}`, userId: updatedCouponHistory.userId, points, type: "earn" });
	}

	return {
		success: true,
		message: "Coupon history updated successfully",
		data: updatedCouponHistory,
	};
};


export const getUserEarnedCouponHistoryService = async (user: any, payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	if (!user.id) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const userCouponHistory = await couponsHistoryModel.find({ userId: user.id, type: "earn" }).skip(offset).limit(limit).populate("couponId");
	const total = await couponsHistoryModel.countDocuments({ userId: user.id, type: "earn" });
	if (!userCouponHistory) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}
	userCouponHistory.sort((a: any, b: any) => (b.isScratched === true ? 1 : 0) - (a.isScratched === true ? 1 : 0));

	return {
		success: true,
		message: "User coupon history retrieved successfully",
		data: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			data: userCouponHistory
		}	,
	};
};

export const getUserCouponHistoryforAdminService = async (
  userId: string,
  payload: any,
  res: Response
) => {
  if (!userId) {
    return errorResponseHandler(
      "User ID is required",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  const page = Number(payload.page) > 0 ? Number(payload.page) : 1;
  const limit = Number(payload.limit) > 0 ? Number(payload.limit) : 10;
  const skip = (page - 1) * limit;

  // Step 1: Fetch all "earn" entries
  const earnHistory = await couponsHistoryModel
    .find({ userId, type: "earn" })
    .populate({ path: "couponId", populate: { path: "offerName" } })
    .lean();

  // Step 2: Fetch all "redeem" entries
  const redeemHistory = await couponsHistoryModel
    .find({ userId, type: "redeem" })
    .select("couponId")
    .lean();

  if (!earnHistory || earnHistory.length === 0) {
	return {
	  success: true,
	  message: "No coupon history found for this user",
	  data: [],
	};
  }

  // Step 3: Extract couponIds from redeem entries
  const redeemedCouponIds = new Set(
    redeemHistory.map((entry) => String(entry.couponId))
  );

  // Step 4: Filter earn entries that do NOT have a redeem entry for the same couponId
  const filteredEarnHistory = earnHistory.filter(
	  (entry) => !redeemedCouponIds.has(String((entry?.couponId as { _id: string })._id))
	);

  // Step 5: Paginate
  const total = filteredEarnHistory.length;
  const paginatedHistory = filteredEarnHistory.slice(skip, skip + limit);

  // Step 6: Return paginated result
  return {
    success: true,
    message: "User coupon history retrieved successfully",
    data: { 
		total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
	  data: paginatedHistory
	},

  };
};


export const postApplyUserCouponService = async (payload: any, res: Response) => {
	const { userId, couponId } = payload;
	console.log('payload: ', payload);
	let pointsTobeRedeemed = 0;

	if (!userId) {
		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	if (!couponId) {
		return errorResponseHandler("Coupon ID is required", httpStatusCode.BAD_REQUEST, res);
	}

	const userCouponHistory = await couponsHistoryModel.find({ userId, couponId }).populate("couponId").lean();
	console.log("userCouponHistory: ", userCouponHistory);

	if (!userCouponHistory || userCouponHistory.length === 0) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}

	// ✅ Check for expiry
	if (userCouponHistory.some((history) => (history.couponId as any)?.expiry < new Date())) {
		return errorResponseHandler("Coupon is expired", httpStatusCode.BAD_REQUEST, res);
	}

	// ✅ Check if already redeemed
	const alreadyRedeemed = userCouponHistory.some((history) => history.type === "redeem");
	if (alreadyRedeemed) {
		return errorResponseHandler("Coupon already redeemed", httpStatusCode.BAD_REQUEST, res);
	}

	// ✅ Calculate points
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

	// ✅ Update user points
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

	if (!updateUserPointsToBeRedeemed) {
		return errorResponseHandler("Failed to update user points", httpStatusCode.INTERNAL_SERVER_ERROR, res);
	}

	// ✅ Log the redemption
	await couponsHistoryModel.create({ userId, couponId, type: "redeem" });

	return {
		success: true,
		message: "Coupon applied successfully",
	};
};


// export const postApplyUserCouponService = async (payload: any, res: Response) => {
// 	const { userId, couponId } = payload;
// 	console.log('payload: ', payload);
// 	let pointsTobeRedeemed = 0;
// 	if (!userId) {
// 		return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
// 	}
// 	const userCouponHistory = await couponsHistoryModel.find({ userId, couponId }).populate("couponId").lean();
// 	console.log("userCouponHistory: ", userCouponHistory);
// 	if (!couponId) {
// 		return errorResponseHandler("Coupon ID is required", httpStatusCode.BAD_REQUEST, res);
// 	}
// 	if (!userCouponHistory || userCouponHistory.length === 0) {
// 		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
// 	}
	
// 	if (userCouponHistory.some((history) => (history.couponId as any)?.expiry < new Date())) {
// 		return errorResponseHandler("Coupon is expired", httpStatusCode.BAD_REQUEST, res);
// 	}
	
// 	if (payload.pointsWorth) {
// 		pointsTobeRedeemed = payload.pointsWorth;
// 	} else {
// 		pointsTobeRedeemed = userCouponHistory.reduce((acc, curr) => {
// 		if (curr.type === "earn") {
// 			return acc + (curr.couponId as any).points;
// 		}
// 		return acc;
// 	}, 0);
// 	}
// 	console.log('pointsTobeRedeemed: ', pointsTobeRedeemed);
// 	const updateUserPointsToBeRedeemed = await usersModel.updateOne(
// 		{ _id: userId },
// 		{
// 			$inc: { activePoints: pointsTobeRedeemed },
// 		}
// 	);
// 	const userData = await usersModel.findById(userId);
// 	if (!userData) {
// 		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
// 	}

// 	// await updatePointsAndMoney(userId, userData.valuePerPoint, userData.totalPoints,);
// 	if (!updateUserPointsToBeRedeemed) {
// 		return errorResponseHandler("Failed to update user points", httpStatusCode.INTERNAL_SERVER_ERROR, res);
// 	}
// 	await couponsHistoryModel.create({ userId, couponId, type: "redeem" });

// 	return {
// 		success: true,
// 		message: "Coupon applied successfully",
// 		// data: userCouponHistory,
// 	};
// };

