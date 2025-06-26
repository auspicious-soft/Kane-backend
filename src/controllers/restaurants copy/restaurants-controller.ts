import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createRestaurantOfferService, createRestaurantService, deleteRestaurantService, getAllRestaurantOfferForUserService, getAllRestaurantOffersService, getAllRestaurantService, getAllRestaurantWithSearchService, getRestaurantByIdService, getRestaurantOfferByIdService, updateRestaurantOfferService, updateRestaurantService } from "../../services/restaurants/restaurants-service";
import { dashboardService } from "../../services/admin/admin-service";

// User Signup
export const dashboardForAdmin = async (req: Request, res: Response) => {
  try {
    const response = await dashboardService(req.query,res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
