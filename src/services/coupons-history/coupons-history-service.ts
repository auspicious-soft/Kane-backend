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
    return errorResponseHandler(
      "User ID is required",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }
  // Step 1: Fetch all coupon history for user
  const history = await couponsHistoryModel
    .find({ userId: userId })
    .populate("couponId")
    .lean();

  if (!history || history.length === 0) {
    return {
      success: true,
      message: "No coupon history found for this user",
      data: [],
    };
  }

  // Step 2: Fetch all redeemed coupons
  const redeemHistory = await couponsHistoryModel
    .find({ userId: userId, type: "redeem" })
    .populate("couponId")
    .lean();

  // Step 3: Extract redeemed coupon IDs
  const redeemedCouponIds = new Set(
    redeemHistory.map((entry: any) => String(entry?.couponId?._id))
  );

  // Step 4: Filter earned coupons (scratched & not redeemed)
  const filteredEarnHistory = history.filter(
    (entry: any) =>
      entry?.type === "earn" &&
      entry?.isScratched === true &&
      !redeemedCouponIds.has(String(entry?.couponId?._id))
  );

  // Step 5: Return based on type
  const responseData = filteredEarnHistory;

  return {
    success: true,
    message: "User coupon history retrieved successfully",
    data: responseData,
  };
};

export const getUserRedeemCouponHistoryService = async (
  user: any,
  payload: any,
  res: Response
) => {
  if (!user?.id) {
    return errorResponseHandler(
      "User ID is required",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  const page = Number(payload.page) > 0 ? Number(payload.page) : 1;
  const limit = Number(payload.limit) > 0 ? Number(payload.limit) : 10;
  const skip = (page - 1) * limit;

  const now = new Date();

  // Step 1: Fetch all coupon history
  const history = await couponsHistoryModel
    .find({ userId: user.id })
    .populate("couponId")
    .lean();

  if (!history || history.length === 0) {
    return {
      success: true,
      message: "No coupon history found for this user",
      data: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        data: [],
      },
    };
  }

  // Step 2: Fetch redeemed coupons
  const redeemHistory = history.filter(
    (entry: any) => entry.type === "redeem"
  );

  // Step 3: Extract redeemed coupon IDs
  const redeemedCouponIds = new Set(
    redeemHistory.map((entry: any) => String(entry?.couponId?._id))
  );

  // Step 4: Earned (non-redeemed, scratched, NOT expired)
  const earnHistory = history.filter((entry: any) => {
    const expiryDate = entry?.couponId?.expiry
      ? new Date(entry.couponId.expiryDate)
      : null;

    const isExpired = expiryDate ? expiryDate < now : false;

    return (
      entry.type === "earn" &&
      entry.isScratched === true &&
      !isExpired &&
      !redeemedCouponIds.has(String(entry?.couponId?._id))
    );
  });

  // Step 5: Expired coupons (type earn only)
  const expiryHistory = history.filter((entry: any) => {
    const expiryDate = entry?.couponId?.expiry
      ? new Date(entry?.couponId?.expiry)
      : null;

    return (
      entry.type === "earn" &&
      expiryDate &&
      expiryDate < now
    );
  });

  // Step 6: Select data based on payload.type
  let selectedHistory: any[] = [];

  switch (payload.type) {
    case "redeem":
      selectedHistory = redeemHistory;
      break;

    case "expiry":
      selectedHistory = expiryHistory;
      break;

    default: // earn
      selectedHistory = earnHistory;
      break;
  }

  const total = selectedHistory.length;
  const paginatedHistory = selectedHistory.slice(skip, skip + limit);

  return {
    success: true,
    message: "User coupon history retrieved successfully",
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginatedHistory,
    },
  };
};


export const getUserCouponForAdminHistoryService = async (
  user: any,
  payload: any,
  res: Response
) => {
  if (!user) {
    return errorResponseHandler(
      "User ID is required",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  const page = Number(payload.page) > 0 ? Number(payload.page) : 1;
  const limit = Number(payload.limit) > 0 ? Number(payload.limit) : 10;
  const skip = (page - 1) * limit;

  const now = new Date();

  // Step 1: Fetch all coupon history
  const history = await couponsHistoryModel
    .find({ userId: user})
    .populate("couponId")
    .lean();

  if (!history || history.length === 0) {
    return {
      success: true,
      message: "No coupon history found for this user",
      data: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        data: [],
      },
    };
  }

  // Step 2: Fetch redeemed coupons
  const redeemHistory = history.filter(
    (entry: any) => entry.type === "redeem"
  );

  // Step 3: Extract redeemed coupon IDs
  const redeemedCouponIds = new Set(
    redeemHistory.map((entry: any) => String(entry?.couponId?._id))
  );

  // Step 4: Earned (non-redeemed, scratched, NOT expired)
  const earnHistory = history.filter((entry: any) => {
    const expiryDate = entry?.couponId?.expiry
      ? new Date(entry.couponId.expiryDate)
      : null;

    const isExpired = expiryDate ? expiryDate < now : false;

    return (
      entry.type === "earn" &&
      entry.isScratched === true &&
      !isExpired &&
      !redeemedCouponIds.has(String(entry?.couponId?._id))
    );
  });

  // Step 5: Expired coupons (type earn only)
  const expiryHistory = history.filter((entry: any) => {
    const expiryDate = entry?.couponId?.expiry
      ? new Date(entry?.couponId?.expiry)
      : null;

    return (
      entry.type === "earn" &&
      expiryDate &&
      expiryDate < now
    );
  });

  // Step 6: Select data based on payload.type
  let selectedHistory: any[] = [];

  switch (payload.type) {
    // case "redeem":
    //   selectedHistory = redeemHistory;
    //   break;

    // case "expiry":
    //   selectedHistory = expiryHistory;
    //   break;

    default: // earn
      selectedHistory = earnHistory;
      break;
  }

  const total = selectedHistory.length;
  const paginatedHistory = selectedHistory.slice(skip, skip + limit);

  return {
    success: true,
    message: "User coupon history retrieved successfully",
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginatedHistory,
    },
  };
};

// export const getUserRedeemCouponHistoryService = async (
//   user: any,
//   payload: any,
//   res: Response
// ) => {
//   if (!user.id) {
//     return errorResponseHandler(
//       "User ID is required",
//       httpStatusCode.BAD_REQUEST,
//       res
//     );
//   }

//   const page = Number(payload.page) > 0 ? Number(payload.page) : 1;
//   const limit = Number(payload.limit) > 0 ? Number(payload.limit) : 10;
//   const skip = (page - 1) * limit;

//   // Step 1: Fetch all coupon history for user
//   const history = await couponsHistoryModel
//   .find({ userId: user.id })
//   .populate("couponId")
//   .lean();

//   // Step 2: Fetch all redeemed coupons
//   const redeemHistory = await couponsHistoryModel
//     .find({ userId: user.id, type: "redeem" })
//     .populate("couponId")
//     .lean();

//   let total = history.length;

//   if (!history || history.length === 0) {
//     return {
//       success: true,
//       message: "No coupon history found for this user",
//       data: {
//         total: 0,
//         page,
//         limit,
//         totalPages: 0,
//         data: [],
//       },
//     };
//   }

//   // Step 3: Extract redeemed coupon IDs
//   const redeemedCouponIds = new Set(
//     redeemHistory.map((entry: any) => String(entry?.couponId?._id))
//   );

//   // Step 4: Filter earned coupons (remove redeemed ones)
//   const filteredEarnHistory = history.filter(
// 	  (entry: any) =>
// 		(!redeemedCouponIds.has(String(entry?.couponId?._id)) && ( entry?.isScratched === true))
// 	);
	
//   // Step 5: Paginate based on type
//   let paginatedHistory;

//   if (payload.type === "redeem") {
//     total = redeemHistory.length;
//     paginatedHistory = redeemHistory.slice(skip, skip + limit);
//   } else {
//     total = filteredEarnHistory.length;
//     paginatedHistory = filteredEarnHistory.slice(skip, skip + limit);
// }

//   return {
//     success: true,
//     message: "User coupon history retrieved successfully",
//     data: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       data: paginatedHistory,
//     },
//   };
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
		await pointsHistoryModel.create({ pointsFrom: "COUPON", title: `Earned points from coupon ${updatedCouponHistory.couponId?.couponName}`, userId: updatedCouponHistory.userId, points, type: "earn" });
	    await couponsHistoryModel
		.findByIdAndUpdate(historyId, { type: "redeem" }, { new: true }) 
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
	const userCouponHistory = await couponsHistoryModel.find({ userId: user.id, type: "earn", isScratched: false }).skip(offset).limit(limit).populate("couponId");
	const total = await couponsHistoryModel.countDocuments({ userId: user.id, type: "earn", isScratched: false });
	if (!userCouponHistory) {
		return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
	}
	userCouponHistory.sort((a: any, b: any) => (b.isScratched === false ? 1 : 0) - (a.isScratched === false ? 1 : 0));

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
    .populate({ path: "couponId", populate: { path: "offerName" } })
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
  let total = filteredEarnHistory.length;
  let paginatedHistory = filteredEarnHistory.slice(skip, skip + limit);
  if(payload.type==="redeem"){
	total = redeemHistory.length;
	paginatedHistory = redeemHistory.slice(skip, skip + limit);
}


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

