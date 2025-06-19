import { Request, Response } from "express";
import { loginService, newPassswordAfterOTPVerifiedService, forgotPasswordService, getAdminDetailsService, verifyOtpPasswordResetService, signupService, verifyOtpSignupService, resendOtpService, logoutService } from "../../services/auth/auth-service";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";

//Auth Controllers
export const login = async (req: Request, res: Response) => {
	try {
		const response = await loginService(req.body, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
export const signup = async (req: Request, res: Response) => {
	try {
		const response = await signupService(req.body, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
export const logout = async (req: Request, res: Response) => {
	try {
		const response = await logoutService(req?.user, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};


export const getAdminDetails = async (req: Request, res: Response) => {
	try {
		const response = await getAdminDetailsService(req.body, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const response = await forgotPasswordService(req.body.email, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
export const verifyOtpPasswordReset = async (req: Request, res: Response) => {
	const { otp } = req.body;
	try {
		const response = await verifyOtpPasswordResetService(otp, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
export const verifyOtpSignup = async (req: Request, res: Response) => {
	const { otp, fcmToken } = req.body;
	try {
		const response = await verifyOtpSignupService(otp, fcmToken, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
export const resendOtp = async (req: Request, res: Response) => {
	const { email } = req.body;
	try {
		const response = await resendOtpService(email, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};

export const newPassswordAfterOTPVerified = async (req: Request, res: Response) => {
	try {
		const response = await newPassswordAfterOTPVerifiedService(req.body, res);
		return res.status(httpStatusCode.OK).json(response);
	} catch (error: any) {
		const { code, message } = errorParser(error);
		return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
	}
};
