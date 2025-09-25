import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { offersHistoryModel } from "../../models/offers-history/offers-history-schema";
import { usersModel } from "../../models/users/users-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";



export const collectAchievementService = async (payload: any, res: Response) => {
  const { userId, offerId, type } = payload;
  if (!userId || !offerId || !type || !["earn", "redeem"].includes(type)) {
    return errorResponseHandler("All achievement history fields are required", httpStatusCode.BAD_REQUEST, res);
  }
  const achievementHistory = await offersHistoryModel.create({
    userId,
    offerId,
    type,
  });
  if (!achievementHistory) {
    return errorResponseHandler("Failed to create achievement history", httpStatusCode.INTERNAL_SERVER_ERROR, res);
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
  userData.visitData[existingVisitIndex].currentVisitStreak = 0;

  await userData.save();
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


export const postApplyUserOfferService = async (payload: any, res: Response) => {
  const { userId, offerId } = payload;
  console.log('payload: ', payload);
  let pointsTobeRedeemed = 0;
  if (!userId) {
    return errorResponseHandler("User ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const userCouponHistory = await offersHistoryModel.find({ userId, offerId }).populate("couponId").lean();
  console.log("userCouponHistory: ", userCouponHistory);
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
  await offersHistoryModel.create({ userId, offerId, type: "redeem" });

  return {
    success: true,
    message: "User offer history retrieved successfully",
    data: userCouponHistory,
  };
};