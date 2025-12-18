import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createAchievementsService, deleteAchievementService, getAchievementsByIdService, getAchievementsByRestaurantIdService, getAllAchievementsService, getAllRestaurantAchievementsService, getUserStampsByRestaurantIdService, getUserVisitsService, updateAchievementService } from "../../services/achievements/achievements-service";

export const createAchievement = async (req: Request, res: Response) => {
  try {
    const response = await createAchievementsService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const response = await getAllAchievementsService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getAllRestaurantAchievements = async (req: Request, res: Response) => {
  try {
    const response = await getAllRestaurantAchievementsService(req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getAchievementById = async (req: Request, res: Response) => {
  try {
    const response = await getAchievementsByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getAchievementsByRestaurantId = async (req: Request, res: Response) => {
  try {
    const response = await getAchievementsByRestaurantIdService(req.user,req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getUserStampsByRestaurantId= async (req: Request, res: Response) => {
  try {
    const response = await getUserStampsByRestaurantIdService(req.user,req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserVisits= async (req: Request, res: Response) => {
  try {
    const response = await getUserVisitsService(req.user,req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const updateAchievement = async (req: Request, res: Response) => {
  try {
    const response = await updateAchievementService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const deleteAchievement = async (req: Request, res: Response) => {
  try {
    const response = await deleteAchievementService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

