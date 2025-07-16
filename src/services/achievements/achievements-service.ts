import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { achievementsModel } from "../../models/achievements/achievements-schema";


export const createAchievementsService = async (payload: any, res: Response) => {
  // if (!userId || !offerId || !type || !["earn", "redeem"].includes(type)) {
  //   return errorResponseHandler("All offer history fields are required", httpStatusCode.BAD_REQUEST, res);
  // }
  const achievement = await achievementsModel.create(payload);
  if (!achievement) {
    return errorResponseHandler("Failed to create achievement", httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
  return {
    success: true,
    message: "achievement created successfully",
    data: achievement
  };
};

export const getAllAchievementsService = async (res: Response) => {
  const offerHistories = await achievementsModel.find({isActive:true}).populate("assignRestaurant").sort({createdAt:-1});
  return {
    success: true,
    message: "Achievements retrieved successfully",
    data: offerHistories
  };
};

export const getAchievementsByIdService = async (achievementId: string, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const achievements = await achievementsModel.findById(achievementId);

  if (!achievements) {
    return errorResponseHandler("Achievements not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement retrieved successfully",
    data: achievements
  };
};


export const updateAchievementService = async (achievementId: string, payload: any, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const updatedAchievement = await achievementsModel.findByIdAndUpdate(
    achievementId,
    { ...payload },
    { new: true }
  );

  if (!updatedAchievement) {
    return errorResponseHandler("Achievement not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement updated successfully",
    data: updatedAchievement
  };
};

export const deleteAchievementService = async (achievementId: string, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const deletedAchievement = await achievementsModel.findByIdAndUpdate(achievementId, {isActive:false});

  if (!deletedAchievement) {
    return errorResponseHandler("Achievement not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement deleted successfully",
    data: deletedAchievement
  };
};