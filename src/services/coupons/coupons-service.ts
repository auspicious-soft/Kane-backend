import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { couponsModel } from "../../models/coupons/coupons-schema";

export const createCouponsService = async (payload: any, res: Response) => {
	const { type, expiry } = payload;
	if (!type || !["offer", "points", "percentage"].includes(type)) {
		return errorResponseHandler("Type is invalid", httpStatusCode.BAD_REQUEST, res);
	}
	if (!expiry || (typeof expiry === "string" && isNaN(new Date(expiry).getTime())) || (typeof expiry !== "string" && !(expiry instanceof Date))) {
		return errorResponseHandler("Invalid expiry date", httpStatusCode.BAD_REQUEST, res);
	}

	const coupons = await couponsModel.create( payload );
	if (!coupons) {
		return errorResponseHandler("Failed to create coupon", httpStatusCode.INTERNAL_SERVER_ERROR, res);
	}
	return {
		success: true,
		message: "Coupons created successfully",
		data: coupons
	};
};

export const getAllCouponsService = async (res: Response) => {
	 const coupons = await couponsModel
    .find({ isActive: true })
    .populate("offerName")
    .sort({ createdAt: -1 });
	return {
		success: true,
		message: "Coupons retrieved successfully",
		data: coupons,
	};
};

export const getCouponByIdService = async (couponId: string, res: Response) => {
	if (!couponId) {
		return errorResponseHandler("Coupons ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const coupons = await couponsModel.findById(couponId).populate({path:"offerName",populate:"restaurantId"})
	;

	if (!coupons) {
		return errorResponseHandler("Coupons not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupons retrieved successfully",
		data: coupons,
	};
};

export const updateCouponService = async (historyId: string, payload: any, res: Response) => {
	if (!historyId) {
		return errorResponseHandler("Coupons ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const updatedCoupons = await couponsModel.findByIdAndUpdate(historyId, { ...payload }, { new: true });

	if (!updatedCoupons) {
		return errorResponseHandler("Coupons not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupons updated successfully",
		data: updatedCoupons,
	};
};


export const deleteCouponService = async (couponId: string, res: Response) => {
	if (!couponId) {
		return errorResponseHandler("Coupons ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const deletedCoupon = await couponsModel.findByIdAndUpdate(couponId, { isActive: false });

	if (!deletedCoupon) {
		return errorResponseHandler("Coupons not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Coupons deleted successfully",
		data: deletedCoupon,
	};
};
