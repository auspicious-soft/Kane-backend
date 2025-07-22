import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { createRestaurantOfferService, createRestaurantService, deleteRestaurantService, getAllRestaurantOfferForUserService, getAllRestaurantOffersService, getAllRestaurantService, getAllRestaurantWithSearchService, getRestaurantByIdService, getRestaurantOfferByIdService, updateRestaurantOfferService, updateRestaurantService } from "../../services/restaurants/restaurants-service";

// User Signup
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const response = await createRestaurantService(req.body, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getAllRestaurant = async (req: Request, res: Response) => {
  try {
    const response = await getAllRestaurantService(req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getAllRestaurantForUser = async (req: Request, res: Response) => {
  try {
    const response = await getAllRestaurantWithSearchService(req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getAllRestaurantOfferForUser = async (req: Request, res: Response) => {
  try {
    const response = await getAllRestaurantOfferForUserService(req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get Restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const response = await getRestaurantByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const response = await updateRestaurantService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const response = await deleteRestaurantService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const createRestaurantOffer = async (req: Request, res: Response) => {
  try {
    const response = await createRestaurantOfferService(req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getAllRestaurantOffers = async (req: Request, res: Response) => {
  try {
    const response = await getAllRestaurantOffersService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const getRestaurantOfferById = async (req: Request, res: Response) => {
  try {
    const response = await getRestaurantOfferByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const updateRestaurantOffer = async (req: Request, res: Response) => {
  try {
    const response = await updateRestaurantOfferService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

