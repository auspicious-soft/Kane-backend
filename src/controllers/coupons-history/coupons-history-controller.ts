import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createCouponsHistoryService, deleteCouponHistoryService, getAllCouponHistoriesService, getCouponHistoryByIdService, getUserCouponHistoryService, postApplyUserCouponService, updateCouponHistoryService } from "../../services/coupons-history/coupons-history-service";

// Create Coupon History
export const createCouponsHistory = async (req: Request, res: Response) => {
  try {
    const response = await createCouponsHistoryService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get All Coupon Histories
export const getAllCouponHistories = async (req: Request, res: Response) => {
  try {
    const response = await getAllCouponHistoriesService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get Coupon History by ID
export const getCouponHistoryById = async (req: Request, res: Response) => {
  try {
    const response = await getCouponHistoryByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Update Coupon History
export const updateCouponHistory = async (req: Request, res: Response) => {
  try {
    const response = await updateCouponHistoryService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Delete Coupon History
export const deleteCouponHistory = async (req: Request, res: Response) => {
  try {
    const response = await deleteCouponHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserCouponHistory = async (req: Request, res: Response) => {
  try {
    const response = await getUserCouponHistoryService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const postApplyUserCoupon = async (req: Request, res: Response) => {
  try {
    const response = await postApplyUserCouponService(req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

