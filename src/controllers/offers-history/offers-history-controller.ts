import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import {
  createOfferHistoryService,
  getAllOfferHistoriesService,
  getOfferHistoryByIdService,
  updateOfferHistoryService,
  deleteOfferHistoryService,
  getUserOfferHistoryService,
  postApplyUserOfferService,
  collectAchievementService,
} from "../../services/offers-history/offers-history-service";

// Create Offer History
export const createOfferHistory = async (req: Request, res: Response) => {
  try {
    const response = await createOfferHistoryService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const collectAchievement = async (req: Request, res: Response) => {
  try {
    const response = await collectAchievementService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
// Get All Offer Histories
export const getAllOfferHistories = async (req: Request, res: Response) => {
  try {
    const response = await getAllOfferHistoriesService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get Offer History by ID
export const getOfferHistoryById = async (req: Request, res: Response) => {
  try {
    const response = await getOfferHistoryByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Update Offer History
export const updateOfferHistory = async (req: Request, res: Response) => {
  try {
    const response = await updateOfferHistoryService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Delete Offer History
export const deleteOfferHistory = async (req: Request, res: Response) => {
  try {
    const response = await deleteOfferHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserOfferHistory = async (req: Request, res: Response) => {
  try {
    const response = await getUserOfferHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const postApplyUserOffer = async (req: Request, res: Response) => {
  try {
    const response = await postApplyUserOfferService(req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};


