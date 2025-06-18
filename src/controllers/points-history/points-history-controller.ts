import { Request, Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createPointsHistoryService, deletePointsHistoryService, getAllPointsHistoriesService, getPointsHistoryByIdService, updatePointsHistoryService } from "../../services/points-history/points-history-service";

// Controller: Create Points History
export const createPointsHistory = async (req: any, res: Response) => {
  try {
    const result = await createPointsHistoryService(req.body, res);
    if (result && result.success) {
      return res.status(201).json(result);
    }
  } catch (error: any) {
    return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
};

// Controller: Get All Points Histories
export const getAllPointsHistories = async (req: any, res: Response) => {
  try {
    const result = await getAllPointsHistoriesService(res);
    if (result && result.success) {
      return res.status(200).json(result);
    }
  } catch (error: any) {
    return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
};

// Controller: Get Points History By ID
export const getPointsHistoryById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getPointsHistoryByIdService(id, res);
    if (result && result.success) {
      return res.status(200).json(result);
    }
  } catch (error: any) {
    return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
};

// Controller: Update Points History
export const updatePointsHistory = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await updatePointsHistoryService(id, req.body, res);
    if (result && result.success) {
      return res.status(200).json(result);
    }
  } catch (error: any) {
    return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
};

// Controller: Delete Points History
export const deletePointsHistory = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deletePointsHistoryService(id, res);
    if (result && result.success) {
      return res.status(200).json(result);
    }
  } catch (error: any) {
    return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
};
