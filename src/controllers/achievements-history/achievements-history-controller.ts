import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createAchievementsHistoryService, deleteAchievementHistoryService, getAchievementHistoryByIdService, getAllAchievementHistoriesService, getUserAchievementHistoryService, postApplyUserAchievementService, updateAchievementHistoryService } from "../../services/achievements-history/achievements-history-service";

// Create Achievement History
export const createAchievementHistory = async (req: Request, res: Response) => {
  try {
    const response = await createAchievementsHistoryService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get All Achievement Histories
export const getAllAchievementHistories = async (req: Request, res: Response) => {
  try {
    const response = await getAllAchievementHistoriesService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get Achievement History by ID
export const getAchievementHistoryById = async (req: Request, res: Response) => {
  try {
    const response = await getAchievementHistoryByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Update Achievement History
export const updateAchievementHistory = async (req: Request, res: Response) => {
  try {
    const response = await updateAchievementHistoryService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Delete Achievement History
export const deleteAchievementHistory = async (req: Request, res: Response) => {
  try {
    const response = await deleteAchievementHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserAchievementHistory = async (req: Request, res: Response) => {
  try {
    const response = await getUserAchievementHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const postApplyUserAchievements = async (req: Request, res: Response) => {
  try {
    const response = await postApplyUserAchievementService(req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
