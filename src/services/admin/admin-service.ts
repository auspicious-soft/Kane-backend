import { httpStatusCode } from "../../lib/constant";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { pointsHistoryModel } from "../../models/points-history/points-history-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { usersModel } from "../../models/users/users-schema";

export const dashboardService = async (payload: any, res: any) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;
	const totalTopLeaders = await usersModel.countDocuments({ isDeleted: false, topLeaderPrivacy: false, totalPoints: { $ne: 0 } });
	const topLeaders = await usersModel
		.find({ isDeleted: false, topLeaderPrivacy: false, totalPoints: { $ne: 0 } })
		.select("-password")
		.sort({ totalPoints: -1 })
		.skip(offset)
		.limit(limit);
	const totalUsers = await usersModel.countDocuments({ isDeleted: false });
	const totalRestaurants = await RestaurantsModel.countDocuments({ isDeleted: false });
	const totalRestaurantsOffers = await RestaurantOffersModel.countDocuments();
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const endOfMonth = new Date(startOfMonth);
	endOfMonth.setMonth(endOfMonth.getMonth() + 1);

	const pointsRedeemed = await pointsHistoryModel.find({
		type: "redeem",
		createdAt: {
			$gte: startOfMonth,
			$lt: endOfMonth,
		},
	});

	const totalPointsRedeemed = pointsRedeemed.reduce((sum, entry) => sum + (entry.points || 0), 0);

	// Calculate percentage changes
	const calculatePercentageChange = (current: number, previous: number): number => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return Number((((current - previous) / previous) * 100).toFixed(2));
	};
	// Previous month metrics
	const prevMonthUsers = await usersModel.countDocuments({
		isDeleted: false,
		createdAt: { $lt: startOfMonth },
	});

	const prevMonthRestaurants = await RestaurantsModel.countDocuments({
		isDeleted: false,
		createdAt: { $lt: startOfMonth },
	});

	const prevMonthOffers = await RestaurantOffersModel.countDocuments({
		createdAt: { $lt: startOfMonth },
	});
	// Previous month date range
	const startOfPrevMonth = new Date(startOfMonth);
	startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

	const endOfPrevMonth = new Date(startOfMonth);
	const prevPointsRedeemed = await pointsHistoryModel.find({
		type: "redeem",
		createdAt: {
			$gte: startOfPrevMonth,
			$lt: endOfPrevMonth,
		},
	});
	const prevTotalPointsRedeemed = prevPointsRedeemed.reduce((sum, entry) => sum + (entry.points || 0), 0);

	const usersPercentageChange = calculatePercentageChange(totalUsers, prevMonthUsers);
	const restaurantsPercentageChange = calculatePercentageChange(totalRestaurants, prevMonthRestaurants);
	const offersPercentageChange = calculatePercentageChange(totalRestaurantsOffers, prevMonthOffers);
	const pointsRedeemedPercentageChange = calculatePercentageChange(totalPointsRedeemed, prevTotalPointsRedeemed);

	return {
		success: true,
		message: "Dashboard retrieved successfully",
		data: {
			page,
			limit,
			total: totalTopLeaders,
			topLeaders,
			totalUsers,
			totalPointsRedeemed,
			totalRestaurants,
			totalRestaurantsOffers,
			usersPercentageChange,
			restaurantsPercentageChange,
			offersPercentageChange,
			pointsRedeemedPercentageChange,
		},
	};
};
