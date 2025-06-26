import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { passwordResetTokenModel } from "../../models/password-token-schema";
import { sendEmailVerificationMail, sendPasswordResetEmail } from "../../utils/mails/mail";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../utils/mails/token";
import { usersModel } from "../../models/users/users-schema";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { referralHistoryModel } from "../../models/referral-history/referral-history-schema";
import { pointsHistoryModel } from "../../models/points-history/points-history-schema";
import { generateBarcode } from "../../utils/generateBarcode";
import { updatePointsAndMoney } from "../users/users-service";

export const loginService = async (payload: any, res: Response) => {
	const { email, password, fcmToken } = payload;
	let user: any = null;
	let userType: "admin" | "user" | null = null;

	user = await adminModel.findOne({ email: email }).select("+password");
	if (user) {
		userType = "admin";
	} else {
		user = await usersModel.findOne({ email: email }).select("+password");
		if (user) {
			userType = "user";
		}
	}
	if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	if (user.isDeleted === true) return errorResponseHandler("User account is deleted", httpStatusCode.FORBIDDEN, res);
	if (userType === "user" && !user.isVerified) {
		const existingToken = await passwordResetTokenModel.findOne({ email });
		if (existingToken) {
			await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
		}

		const passwordResetToken = await generatePasswordResetToken(email);
		if (passwordResetToken !== null) {
			await sendEmailVerificationMail(email, passwordResetToken.token);
			return { success: true, message: "Your email is not verified. Verification email sent with otp", data: { user, token: null } };
		}
	}
	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return errorResponseHandler("Invalid password", httpStatusCode.UNAUTHORIZED, res);
	}
	const userObject = user.toObject() as typeof user & { password?: string };
	userObject.fcmToken = fcmToken;
	if (fcmToken) {
		userObject.fcmToken = fcmToken;
		user.fcmToken = fcmToken;
		await user.save();
	}
	delete userObject.password;

	let token = "";
	if (userType === "user") {
		token = jwt.sign({ id: user._id, email: user.email, type: userType }, process.env.AUTH_SECRET || "your_jwt_secret");
	}
	if (userType === "user") {
		return {
			success: true,
			message: "Login successful",
			data: {
				user: userObject,
				token,
			},
		};
	} else {
		return {
			success: true,
			message: "Login successful",
			data: {
				user: userObject,
			},
		};
	}
};

async function handleReferral(referralCode: string | null | undefined, newUserId: any, fullName: any, res: any) {
	const REFERRER_POINTS = 100;
	const REFERRED_USER_POINTS = 50;
	if (!referralCode) return;

	const referrer = await usersModel.findOne({ referralCode: referralCode });
	if (!referrer) {
		return errorResponseHandler("Referrer NOT FOUND", httpStatusCode.NOT_FOUND, res);
	}

	// Create referral history
	await referralHistoryModel.create({
		referrer: referrer._id,
		referredUser: newUserId,
		referralCode,
		pointsAwardedToReferrer: REFERRER_POINTS,
		pointsAwardedToReferred: REFERRED_USER_POINTS,
	});

	// Update referrer's points and referredUsers atomically
	await usersModel.updateOne(
		{ _id: referrer._id },
		{
			$inc: { totalPoints: REFERRER_POINTS, activePoints: REFERRER_POINTS },
			$push: { referredUsers: newUserId },
		}
	);
	const updatedReferrer = await usersModel.findById(referrer._id);
	if (updatedReferrer) {
		await updatePointsAndMoney(updatedReferrer._id, updatedReferrer.valuePerPoint, updatedReferrer.totalPoints);
	}
	await pointsHistoryModel.create({ pointsFrom: "REFERRAL_TO", title: `${fullName} used your referral code.`, userId: referrer._id, points: REFERRER_POINTS, type: "earn" });
	// Update new user's points and referredBy atomically
	await usersModel.updateOne(
		{ _id: newUserId },
		{
			$inc: { totalPoints: REFERRED_USER_POINTS, activePoints: REFERRED_USER_POINTS },
			$set: { referredBy: referrer._id },
		}
	);
	const updatedReferredUser = await usersModel.findById(newUserId);
	if (updatedReferredUser) {
	await updatePointsAndMoney(updatedReferredUser._id, updatedReferredUser.valuePerPoint, updatedReferredUser.totalPoints);
	}
	await pointsHistoryModel.create({ pointsFrom: "USED_REFERRAL_CODE", title: `Used referral code.`, userId: newUserId, points: REFERRED_USER_POINTS, type: "earn" });

	console.log("Referral processed for user:", newUserId);
}
export const signupService = async (payload: any, res: Response) => {
	const { email, password, referralCodeSignup } = payload;
	const referralCodeGenerator = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFCGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
	// Check if user already exists in usersModel
	let existingUser = await usersModel.findOne({ email: email });
	let retries = 3;
	let user;
	if (existingUser) {
		return errorResponseHandler("User already exists", httpStatusCode.CONFLICT, res);
	}
	// Prevent signup for admin emails
	let existingAdmin = await adminModel.findOne({ email: email });
	if (existingAdmin) {
		return errorResponseHandler("Signup not allowed for admin", httpStatusCode.FORBIDDEN, res);
	}

	// Hash password and create new user
	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = await usersModel.create({ ...payload, password: hashedPassword });
generateBarcode(newUser.identifier)
	const userObject = newUser.toObject() as typeof newUser & { password?: string };
	if ("password" in userObject) {
		delete userObject.password;
	}

	// //TODO: if there is issue of duplicate key errror for referralcode
	// while (retries > 0) {
	//     try {
	//       user = await usersModel.create({...payload, password: hashedPassword,  });

	//       break;
	//     } catch (error) {
	//       if (error.code === 11000 && error.keyPattern.referralCode) {
	//         retries--;
	//         payload.referralCode = referralCodeGenerator(); // Regenerate code
	//         if (retries === 0) {
	//           return res.status(500).json({ message: "Failed to generate unique referral code" });
	//         }
	//         continue;
	//       }
	//       throw error;
	//     }
	//   }
	if (payload.referralCodeSignup) {
		await handleReferral(referralCodeSignup, newUser._id, newUser.fullName, res);
	}
	const existingToken = await passwordResetTokenModel.findOne({ email });
	if (existingToken) {
		await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
	}
	const passwordResetToken = await generatePasswordResetToken(email);
	if (passwordResetToken !== null) {
		await sendEmailVerificationMail(email, passwordResetToken.token);
		return { success: true, message: "Verification email sent with otp" };
	}
};

export const forgotPasswordService = async (email: string, res: Response) => {
	let user: any = null;
	let userType: "admin" | "user" | null = null;

	user = await adminModel.findOne({ email: email }).select("+password");
	if (user) {
		userType = "admin";
	} else {
		user = await usersModel.findOne({ email: email }).select("+password");
		if (user) {
			userType = "user";
		}
	}
	if (!user) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res);

	const existingToken = await passwordResetTokenModel.findOne({ email });
	if (existingToken) {
		await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
	}

	const passwordResetToken = await generatePasswordResetToken(email);
	if (passwordResetToken !== null) {
		await sendPasswordResetEmail(email, passwordResetToken.token);
		return { success: true, message: "Password reset email sent with otp" };
	}
};

export const verifyOtpPasswordResetService = async (token: string, res: Response) => {
	const existingToken = await getPasswordResetTokenByToken(token);
	if (!existingToken) return errorResponseHandler("Please enter valid OTP.", httpStatusCode.BAD_REQUEST, res);

	const hasExpired = new Date(existingToken.expires) < new Date();
	if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);

	return { success: true, message: "OTP verified successfully" };
};
export const verifyOtpSignupService = async (otp: string, fcmToken: string, res: Response) => {
	const existingToken = await getPasswordResetTokenByToken(otp);
	if (!existingToken) return errorResponseHandler("Please enter valid OTP.", httpStatusCode.BAD_REQUEST, res);

	const hasExpired = new Date(existingToken.expires) < new Date();
	if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);
	const user = await usersModel.findOne({ email: existingToken.email });
	if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	// If user is found, delete the token
	await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
	user.isVerified = true;
	user.fcmToken = fcmToken;
	await user.save();
	// Remove password from user object
	const userObject = user.toObject() as typeof user & { password?: string };
	if ("password" in userObject) {
		delete userObject.password;
	}
	// Generate JWT token for the user
	const token = jwt.sign(
		{ id: user._id, email: user.email, type: "user" },
		process.env.AUTH_SECRET || "your_jwt_secret"
		// { expiresIn: "1d" }
	);
	return { success: true, message: "OTP verified successfully", data: { user: userObject, token } };
};

export const newPassswordAfterOTPVerifiedService = async (payload: { password: string; otp: string }, res: Response) => {
	const { password, otp } = payload;

	const existingToken = await getPasswordResetTokenByToken(otp);
	if (!existingToken) return errorResponseHandler("Please enter valid OTP.", httpStatusCode.BAD_REQUEST, res);

	// const hasExpired = new Date(existingToken.expires) < new Date();
	// if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);

	let user: any = null;
	let userType: "admin" | "user" | null = null;
	let updatedUser: any = null;

	user = await adminModel.findOne({ email: existingToken.email });
	if (user) {
		userType = "admin";
		const hashedPassword = await bcrypt.hash(password, 10);
		updatedUser = await adminModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
	} else {
		user = await usersModel.findOne({ email: existingToken.email });
		if (user) {
			userType = "user";
			const hashedPassword = await bcrypt.hash(password, 10);
			updatedUser = await usersModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
		}
	}

	if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

	await passwordResetTokenModel.findByIdAndDelete(existingToken._id);

	// Remove password from response
	const userObject = updatedUser?.toObject ? updatedUser.toObject() : updatedUser;
	if (userObject && userObject.password) {
		delete userObject.password;
	}
	return {
		success: true,
		message: "Password updated successfully",
		data: {
			userType,
			user: userObject,
		},
	};
};

export const resendOtpService = async (email: any, res: Response) => {
	if (!email) {
		return errorResponseHandler("Email is required", httpStatusCode.BAD_REQUEST, res);
	}

	// Check if user exists
	const user = await usersModel.findOne({ email });

	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const existingToken = await passwordResetTokenModel.findOne({ email });
	if (existingToken) {
		await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
	}
	// Generate new OTP
	const otp = await generatePasswordResetToken(email);

	// Send OTP via email
	await sendEmailVerificationMail(email, otp.token);

	return {
		success: true,
		message: "OTP sent successfully to your email",
	};
};

export const getAdminDetailsService = async (payload: any, res: Response) => {
	const results = await adminModel.find();
	return {
		success: true,
		data: results,
	};
};
export const logoutService = async (userId: any, res: Response) => {
	const user = await usersModel.findById({ _id: userId.id });
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	user.fcmToken = "";
	await user.save();
	return {
		success: true,
		message: "User logged out successfully",
	};
};
export const verifyReferralCodeService = async (payload: any, res: Response) => {
	const validReferralCode = await usersModel.findOne({ referralCode: payload.referralCode });
	if (!validReferralCode) {
		return errorResponseHandler("Invalid Referral Code", httpStatusCode.NOT_FOUND, res);
	}
	return {
		success: true,
		message: "Referral code verified successfully",
	};
};
