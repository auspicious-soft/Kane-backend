import { Response } from "express";
import bcrypt from "bcryptjs";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";
import { usersModel } from "../../models/users/users-schema";
import { of, type } from "./../../../node_modules/next/dist/compiled/webpack/bundle5";
import { offersHistoryModel } from "./../../models/offers-history/offers-history-schema";
import { pointsHistoryModel } from './../../models/points-history/points-history-schema';

// Get All Users
export const getAllUsersService = async (payload: any) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	// Get search query from queryBuilder
	let { query, sort } = queryBuilder(payload, ["fullName", "email", "firstName", "lastName"]);

	const totalUsers = await usersModel.countDocuments(query);
	const users = await usersModel.find(query).sort(sort).skip(offset).limit(limit).select("-password");

	return {
		success: true,
		message: "Users retrieved successfully",
		data: {
			users,
			page,
			limit,
			total: totalUsers,
		},
	};
};

// Get User by ID
export const getUserByIdService = async (id: string, res: Response) => {
	const user = await usersModel.findById(id).select("-password");
	//TODO add offer-history and points-history
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	return {
		success: true,
		message: "User retrieved successfully",
		data: user,
	};
};
export const getUserHistoryService = async (id: string, payload: any, res: Response) => {
	const user = await usersModel.findById(id).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const query = { userId: id };
  let history;
  let totalHistory;
  if (payload.type === "points") {
		totalHistory = await pointsHistoryModel.countDocuments(query);
		history = await pointsHistoryModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
	} else if (payload.type === "offer") {
		totalHistory = await offersHistoryModel.countDocuments(query);
		history = await offersHistoryModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
	} else {
		totalHistory = await offersHistoryModel.countDocuments(query);
		history = await offersHistoryModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
	}
	return {
		success: true,
		message: "User retrieved successfully",
		data: {
			user,
			history,
			pagination: {
				page,
				limit,
				total: totalHistory,
			},
		},
	};
};

export const getCurrentUserService = async (userData: any, res: Response) => {
	const user = await usersModel.findById(userData.id).select("-password");
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "User retrieved successfully",
		data: user,
	};
};

// Update User
export const updateUserService = async (id: string, payload: any, res: Response) => {
	const user = await usersModel.findById(id);
	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	// If updating password, hash it
	if (payload.password) {
		payload.password = await bcrypt.hash(payload.password, 10);
	}

	// If updating email, set verification status to false
	if (payload.email && payload.email !== user.email) {
		payload.isVerified = false;
	}

	const updatedUser = await usersModel.findByIdAndUpdate(id, payload, { new: true }).select("-password");

	return {
		success: true,
		message: "User updated successfully",
		data: updatedUser,
	};
};

// Delete User
export const deleteUserService = async (id: string, res: Response) => {
	const user = await usersModel.findById(id);

	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	await usersModel.findByIdAndUpdate(id, { isDeleted: true });

	return {
		success: true,
		message: "User deleted successfully",
	};
};
export const blockUserService = async (id: string, res: Response) => {
	const user = await usersModel.findById(id);

	if (!user) {
		return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
	}

	await usersModel.findByIdAndUpdate(id, { isBlocked: user.isBlocked ? false : true });

	return {
		success: true,
		message: `User ${user.isBlocked ? "unblocked" : "blocked"} successfully`,
	};
};
