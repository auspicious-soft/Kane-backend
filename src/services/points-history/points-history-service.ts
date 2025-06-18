import { Response } from "express";
import bcrypt from "bcryptjs";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { pointsHistoryModel } from "../../models/points-history/points-history-schema";


// Create Points History
export const createPointsHistoryService = async (payload: any, res: Response) => {
  if (!payload) {
    return errorResponseHandler("Points history data is required", httpStatusCode.BAD_REQUEST, res);
  }
  const pointsHistory = await pointsHistoryModel.create(payload);
  return {
    success: true,
    message: "Points history created successfully",
    data: pointsHistory
  };
};

// Get All Points Histories
export const getAllPointsHistoriesService = async (res: Response) => {
  const pointsHistories = await pointsHistoryModel.find({});
  return {
    success: true,
    message: "Points histories retrieved successfully",
    data: pointsHistories
  };
};

// Get Points History By ID
export const getPointsHistoryByIdService = async (pointsHistoryId: string, res: Response) => {
  if (!pointsHistoryId) {
    return errorResponseHandler("Points history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const pointsHistory = await pointsHistoryModel.findById(pointsHistoryId);
  if (!pointsHistory) {
    return errorResponseHandler("Points history not found", httpStatusCode.NOT_FOUND, res);
  }
  return {
    success: true,
    message: "Points history retrieved successfully",
    data: pointsHistory
  };
};

// Update Points History
export const updatePointsHistoryService = async (pointsHistoryId: string, payload: any, res: Response) => {
  if (!pointsHistoryId) {
    return errorResponseHandler("Points history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const updatedPointsHistory = await pointsHistoryModel.findByIdAndUpdate(
    pointsHistoryId,
    payload,
    { new: true }
  );
  if (!updatedPointsHistory) {
    return errorResponseHandler("Points history not found", httpStatusCode.NOT_FOUND, res);
  }
  return {
    success: true,
    message: "Points history updated successfully",
    data: updatedPointsHistory
  };
};

// Delete Points History
export const deletePointsHistoryService = async (pointsHistoryId: string, res: Response) => {
  if (!pointsHistoryId) {
    return errorResponseHandler("Points history ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const deletedPointsHistory = await pointsHistoryModel.findByIdAndDelete(pointsHistoryId);
  if (!deletedPointsHistory) {
    return errorResponseHandler("Points history not found", httpStatusCode.NOT_FOUND, res);
  }
  return {
    success: true,
    message: "Points history deleted successfully",
    data: deletedPointsHistory
  };
};
