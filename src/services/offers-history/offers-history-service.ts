import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { offersHistoryModel } from "../../models/offers-history/offers-history-schema";
import { usersModel } from "../../models/users/users-schema";


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
