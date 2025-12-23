import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { offersHistoryModel } from "../../models/offers-history/offers-history-schema";
import { usersModel } from "../../models/users/users-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { UserVisitsModel } from "../../models/user-visits/user-visits";
import { sendNotification } from "../../utils/FCM/FCM";



export const collectAchievementService = async (payload: any, res: Response) => {
  const { userId, offerId, type } = payload;
  if (!userId || !offerId  ) {
    return errorResponseHandler("All achievement history fields are required", httpStatusCode.BAD_REQUEST, res);
  }
  const existingHistory = await offersHistoryModel.findOne({ userId, offerId, type: "redeem" });
  if (existingHistory) {
    return errorResponseHandler("Achievement already collected", httpStatusCode.BAD_REQUEST, res);
  }

  const userData = await usersModel.findById(userId);

  if (!userData) {
    return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  }

  const offer = await RestaurantOffersModel.findById(offerId);
  const restaurant = offer ? offer.restaurantId : null;
  if (!offer) {
    return errorResponseHandler("Offer not found", httpStatusCode.NOT_FOUND, res);
  }
  if (!restaurant) {
    return errorResponseHandler("Assigned restaurant not found for this achievement", httpStatusCode.NOT_FOUND, res);
  }
  const existingVisitIndex = userData.visitData.findIndex((visit: any) => visit.restaurantId.toString() === restaurant.toString());
  // userData.visitData[existingVisitIndex].totalVisits += 1;
  if(offer.visits > userData.visitData[existingVisitIndex].currentVisitStreak){
    return errorResponseHandler("You cannot collect this achievement", httpStatusCode.NOT_FOUND, res);
  }
  
  userData.visitData[existingVisitIndex].currentVisitStreak -= offer.visits;
  const achievementHistory = await offersHistoryModel.create({
    userId,
    offerId,
    type: "redeem",
  });
  const stamps = await UserVisitsModel.find({ restaurantId: restaurant, userId: userId, visitUsed: false}).populate("restaurantId").sort({createdAt:1}).limit(offer.visits);
  const stampIds = stamps.map(stamp => stamp._id);
  await UserVisitsModel.updateMany(
    { _id: { $in: stampIds } },
    { $set: { visitUsed: true } }
  );
  if (!achievementHistory) {
    return errorResponseHandler("Failed to create achievement history", httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
  await userData.save();
  await sendNotification({userIds:[userId], type: "Stamp_Collected"});
  
  return {
    success: true,
    message: "Achievement collected successfully",
    data: achievementHistory,
  };
};
export const createOfferHistoryService = async (payload: any, res: Response) => {
  const { userId, offerId, type, freeItem } = payload;
  if (!userId || !offerId || !type || !["earn", "redeem"].includes(type)) {
    return errorResponseHandler("All offer history fields are required", httpStatusCode.BAD_REQUEST, res);
  }
  const offerHistory = await offersHistoryModel.create({
    userId,
    offerId,
    type,
    freeItem
  });
  if (!offerHistory) {
    return errorResponseHandler("Failed to create offer history", httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
  return {
    success: true,
    message: "Offer history created successfully",
    data: offerHistory
  };
};

export const getAllOfferHistoriesService = async (res: Response) => {
  const offerHistories = await offersHistoryModel.find({});
  return {
    success: true,
    message: "Offer histories retrieved successfully",
    data: offerHistories
  };
};

export const getOfferHistoryByIdService = async (historyId: string, res: Response) => {
  if (!historyId) {
    return errorResponseHandler("Offer history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const offerHistory = await offersHistoryModel.findById(historyId);

  if (!offerHistory) {
    return errorResponseHandler("Offer history not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Offer history retrieved successfully",
    data: offerHistory
  };
};

export const updateOfferHistoryService = async (historyId: string, payload: any, res: Response) => {
  if (!historyId) {
    return errorResponseHandler("Offer history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const updatedOfferHistory = await offersHistoryModel.findByIdAndUpdate(
    historyId,
    { ...payload },
    { new: true }
  );

  if (!updatedOfferHistory) {
    return errorResponseHandler("Offer history not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Offer history updated successfully",
    data: updatedOfferHistory
  };
};

export const deleteOfferHistoryService = async (historyId: string, res: Response) => {
  if (!historyId) {
    return errorResponseHandler("Offer history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const deletedOfferHistory = await offersHistoryModel.findByIdAndDelete(historyId);

  if (!deletedOfferHistory) {
    return errorResponseHandler("Offer history not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Offer history deleted successfully",
    data: deletedOfferHistory
  };
};
export const getUserOfferHistoryService = async (userId: string, res: Response) => {
  if (!userId) {
    return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const userOfferHistory = await offersHistoryModel.find({ userId , type: "earn" }).populate('offerId');

  if (!userOfferHistory) {
    return errorResponseHandler("No offer history found for this user", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "User offer history retrieved successfully",
    data: userOfferHistory
  };
};
// export const getUserOfferHistoryForAdminService = async (userId: string,payload: any, res: Response) => {
//   if (!userId) {
//     return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
//   }

//   // Step 1: Fetch all "earn" entries
//   const earnHistory = await offersHistoryModel
//   .find({ userId, type: "earn" })
//   .populate({ path: "offerId", populate: { path: "restaurantId" } })
//   .lean();

//   // Step 2: Fetch all "redeem" entries
//   const redeemHistory = await offersHistoryModel
//   .find({ userId, type: "redeem" })
//   .select("offerId")
//   .lean();

//   if (!earnHistory || earnHistory.length === 0) {
//     return errorResponseHandler("No offer history found for this user", httpStatusCode.NOT_FOUND, res);
//   }

//   // Step 3: Extract offerIds from redeem entries
// const redeemedOfferIds = new Set(redeemHistory.map((entry) => String(entry.offerId)));
// console.log('redeemedOfferIds: ', redeemedOfferIds);

// const filteredEarnHistory = earnHistory.filter(
//   (entry) => !redeemedOfferIds.has(String((entry.offerId as { _id: string })._id))
// );

//   return {
//     success: true,
//     message: "User offer history retrieved successfully",
//     data: filteredEarnHistory,
//   };
// };
export const getUserOfferHistoryForAdminService = async (
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
  const earnHistory = await offersHistoryModel
    .find({ userId, type: "earn" })
    .populate({ path: "offerId", populate: { path: "restaurantId" } })
    .lean();

  // Step 2: Fetch all "redeem" entries
  const redeemHistory = await offersHistoryModel
    .find({ userId, type: "redeem" })
    .select("offerId")
    .lean();

  if (!earnHistory || earnHistory.length === 0) {
    // return errorResponseHandler(
    //   "No offer history found for this user",
    //   httpStatusCode.NOT_FOUND,
    //   res
    // );
    return {
      success: true,
      message: "No offer history found for this user",
      data: [],
    };
  }

  // Step 3: Extract offerIds from redeem entries
  const redeemedOfferIds = new Set(
    redeemHistory.map((entry) => String(entry.offerId))
  );

  // Step 4: Filter earn history to remove redeemed offers
  const filteredEarnHistory = earnHistory.filter(
    (entry) => !redeemedOfferIds.has(String((entry.offerId as { _id: string })._id))
  );

  // Step 5: Paginate
  const total = filteredEarnHistory.length;
  const paginatedHistory = filteredEarnHistory.slice(skip, skip + limit);

  return {
    success: true,
    message: "User offer history retrieved successfully",
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data:paginatedHistory
    },
  };
};

export const getUserOfferHistoryForUserService = async (
  user: any,
  payload: any,
  res: Response
) => {
  console.log('payload: ', payload);
  if (!user.id) {
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
  const earnHistory = await offersHistoryModel
    .find({ userId: user.id, })
    .populate({ path: "offerId", populate: { path: "restaurantId" } })
    .lean();
  const totalEarnedOffers = await offersHistoryModel.countDocuments({ userId: user.id, type: "earn" });
  // Step 2: Fetch all "redeem" entries
  // const redeemHistory = await offersHistoryModel
  //   .find({ userId: user.id, type: "redeem" })
  //   .select("offerId")
  //   .lean();

  const total = earnHistory.length;
  if (!earnHistory || earnHistory.length === 0) {
    // return errorResponseHandler(
    //   "No offer history found for this user",
    //   httpStatusCode.NOT_FOUND,
    //   res
    // );
    return {
      success: true,
      message: "No offer history found for this user",
      data:{
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: [],
      }
    };
  }

  // Step 3: Extract offerIds from redeem entries
  // const redeemedOfferIds = new Set(
  //   redeemHistory.map((entry) => String(entry.offerId))
  // );

  // Step 4: Filter earn history to remove redeemed offers
  // const filteredEarnHistory = earnHistory.filter(
  //   (entry) => !redeemedOfferIds.has(String((entry.offerId as { _id: string })._id))
  // );

  // Step 5: Paginate
  const paginatedHistory = earnHistory.slice(skip, skip + limit);

  return {
    success: true,
    message: "User offer history retrieved successfully",
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data:paginatedHistory 
    },
  };
};



export const postApplyUserOfferService = async (payload: any, res: Response) => {
  const { userId, offerId } = payload;
  let pointsTobeRedeemed = 0;
  if (!userId) {
    return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const userCouponHistory = await offersHistoryModel.find({ userId, offerId }).populate("offerId").lean();
  if (!userCouponHistory || userCouponHistory.length === 0) {
    return errorResponseHandler("No coupon history found for this user", httpStatusCode.NOT_FOUND, res);
  }
  
  if (userCouponHistory.some((history) => (history.offerId as any)?.expiry < new Date())) {
    return errorResponseHandler("Offer is expired", httpStatusCode.BAD_REQUEST, res);
  }
  
  if (payload.pointsWorth) {
    pointsTobeRedeemed = payload.pointsWorth;
  } else {
    pointsTobeRedeemed = userCouponHistory.reduce((acc, curr) => {
    if (curr.type === "earn") {
      return acc + (curr.offerId as any).points;
    }
    return acc;
  }, 0);
  } 
  
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
  await offersHistoryModel.create({ userId, offerId, type: "redeem" });

  return {
    success: true,
    message: "User offer history retrieved successfully",
    data: userCouponHistory,
  };
};