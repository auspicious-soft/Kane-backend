import { Response } from "express";
import bcrypt from "bcryptjs";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { queryBuilder } from "../../utils";

export const createRestaurantService = async (payload: any, res: Response) => {
	const { restaurantDetails, restaurantOffers } = payload;
	if (!restaurantDetails) {
		return errorResponseHandler("Restaurant details are required", httpStatusCode.BAD_REQUEST, res);
	}
	const { restaurantName, image } = restaurantDetails;
	if (!restaurantName) {
		return errorResponseHandler("Restaurant name is required", httpStatusCode.BAD_REQUEST, res);
	}
	const restaurant = await RestaurantsModel.create({
		restaurantName,
		image,
	});

	if (restaurantOffers && restaurantOffers.length > 0) {
		const offersWithRestaurantId = restaurantOffers.map((offer: any) => ({
			...offer,
			restaurantId: restaurant._id,
		}));

		// Insert all offers at once
		await RestaurantOffersModel.insertMany(offersWithRestaurantId);
	}
	return {
		success: true,
		message: "Restaurant created successfully",
		data: restaurant,
	};
};
// export const getAllRestaurantService = async (payload: any, res: Response) => {
// 	const restaurants = await RestaurantsModel.find({ isDeleted: false }).sort({ createdAt: -1 });

// 	// Get offer counts for all restaurants
// 	const offerCounts = await RestaurantOffersModel.aggregate([{ $group: { _id: "$restaurantId", count: { $sum: 1 } } }]);

// 	// Map offer counts to a dictionary for quick lookup
// 	const offerCountMap: Record<string, number> = {};
// 	offerCounts.forEach((item: any) => {
// 		offerCountMap[item._id.toString()] = item.count;
// 	});

// 	// Attach offer count to each restaurant
// 	const restaurantsWithOffers = restaurants.map((restaurant: any) => ({
// 		...restaurant.toObject(),
// 		offerCount: offerCountMap[restaurant._id.toString()] || 0,
// 	}));

// 	return {
// 		success: true,
// 		message: "Restaurants retrieved successfully",
// 		data: restaurantsWithOffers,
// 	};
// };

export const getAllRestaurantService = async (payload: any, res: Response) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalRestaurants = await RestaurantsModel.countDocuments({ isDeleted: false });
    const restaurants = await RestaurantsModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

    // Get offer counts for all restaurants
    const offerCounts = await RestaurantOffersModel.aggregate([
        { $group: { _id: "$restaurantId", count: { $sum: 1 } } }
    ]);

    // Map offer counts to a dictionary for quick lookup
    const offerCountMap: Record<string, number> = {};
    offerCounts.forEach((item: any) => {
        offerCountMap[item._id.toString()] = item.count;
    });

    // Attach offer count to each restaurant
    const restaurantsWithOffers = restaurants.map((restaurant: any) => ({
        ...restaurant.toObject(),
        offerCount: offerCountMap[restaurant._id.toString()] || 0,
    }));

    return {
        success: true,
        message: "Restaurants retrieved successfully",
        data: {
            restaurants: restaurantsWithOffers,
            page,
            limit,
            total: totalRestaurants,
        },
    };
};
export const getRestaurantByIdService = async (restaurantId: any, res: Response) => {
	if (!restaurantId) {
		return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const restaurant = await RestaurantsModel.findById(restaurantId);

	if (!restaurant) {
		return errorResponseHandler("Restaurant not found", httpStatusCode.NOT_FOUND, res);
	}
	const offers = await RestaurantOffersModel.find({ restaurantId: restaurantId });
	return {
		success: true,
		message: "Restaurant retrieved successfully",
		data: { restaurant, offers },
	};
};
export const updateRestaurantService = async (restaurantId: string, payload: any, res: Response) => {
	if (!restaurantId) {
		return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const { restaurantName, image } = payload;
	if (!restaurantName) {
		return errorResponseHandler("Restaurant name is required", httpStatusCode.BAD_REQUEST, res);
	}
	const updatedRestaurant = await RestaurantsModel.findByIdAndUpdate(restaurantId, { restaurantName, image }, { new: true });

	if (!updatedRestaurant) {
		return errorResponseHandler("Restaurant not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Restaurant updated successfully",
		data: updatedRestaurant,
	};
};
export const deleteRestaurantService = async (restaurantId: string, res: Response) => {
	if (!restaurantId) {
		return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const deletedRestaurant = await RestaurantsModel.findByIdAndUpdate(restaurantId, { isDeleted: true }, { new: true });

	if (!deletedRestaurant) {
		return errorResponseHandler("Restaurant not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Restaurant deleted successfully",
		data: deletedRestaurant,
	};
};

export const createRestaurantOfferService = async (payload: any, res: Response) => {
	const { restaurantId, offerName, image, description, visits, redeemInStore, unlockRewards } = payload;
	if (!restaurantId) {
		return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	if (!offerName || !description || !visits || !redeemInStore || !unlockRewards) {
		return errorResponseHandler("All offer fields are required", httpStatusCode.BAD_REQUEST, res);
	}
	const restaurantOffer = await RestaurantOffersModel.create({
		restaurantId,
		offerName,
		image,
		description,
		visits,
		redeemInStore,
		unlockRewards,
	});

	return {
		success: true,
		message: "Restaurant offer created successfully",
		data: restaurantOffer,
	};
};
export const getAllRestaurantOffersService = async (res: Response) => {
	const restaurantOffers = await RestaurantOffersModel.find().populate("restaurantId");

	return {
		success: true,
		message: "Restaurant offers retrieved successfully",
		data: restaurantOffers,
	};
};
export const getRestaurantOfferByIdService = async (offerId: string, res: Response) => {
	if (!offerId) {
		return errorResponseHandler("Offer ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const restaurantOffer = await RestaurantOffersModel.findById(offerId).populate("restaurantId");

	if (!restaurantOffer) {
		return errorResponseHandler("Restaurant offer not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Restaurant offer retrieved successfully",
		data: restaurantOffer,
	};
};
export const updateRestaurantOfferService = async (offerId: string, payload: any, res: Response) => {
	if (!offerId) {
		return errorResponseHandler("Offer ID is required", httpStatusCode.BAD_REQUEST, res);
	}
	const { restaurantId, offerName, image, description, visits, redeemInStore, unlockRewards } = payload;
	// if (!offerName || !description || !visits || !redeemInStore || !unlockRewards) {
	//   return errorResponseHandler("All offer fields are required", httpStatusCode.BAD_REQUEST, res);
	// }
	const updatedOffer = await RestaurantOffersModel.findByIdAndUpdate(offerId, { restaurantId, offerName, image, description, visits, redeemInStore, unlockRewards }, { new: true });

	if (!updatedOffer) {
		return errorResponseHandler("Restaurant offer not found", httpStatusCode.NOT_FOUND, res);
	}

	return {
		success: true,
		message: "Restaurant offer updated successfully",
		data: updatedOffer,
	};
};

export const getAllRestaurantWithSearchService = async (payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	// Get search query from queryBuilder
	let { query, sort } = queryBuilder(payload, ["restaurantName"]);

	const totalRestaurants = await RestaurantsModel.countDocuments({ ...query, isDeleted: false });
	const restaurants = await RestaurantsModel.find({ ...query, isDeleted: false })
		.sort(sort)
		.skip(offset)
		.limit(limit)
		.select("-password");

	return {
		success: true,
		message: "Restaurants retrieved successfully",
		data: {
			restaurants,
			page,
			limit,
			total: totalRestaurants,
		},
	};
};
export const getAllRestaurantOfferForUserService = async (payload: any, res: Response) => {
	const page = parseInt(payload.page as string) || 1;
	const limit = parseInt(payload.limit as string) || 10;
	const offset = (page - 1) * limit;

	// Get search query from queryBuilder
	// let { query, sort } = queryBuilder(payload, ["restaurantName"]);
	let totalRestaurants;
	let restaurantOffers;
	if (payload.id) {
		totalRestaurants = await RestaurantOffersModel.countDocuments({ restaurantId: payload.id });
		restaurantOffers = await RestaurantOffersModel.find({ restaurantId: payload.id }).sort().skip(offset).limit(limit).select("visits image description offerName _id").populate("restaurantId");
	} else {
		totalRestaurants = await RestaurantOffersModel.countDocuments();
		restaurantOffers = await RestaurantOffersModel.find().sort().skip(offset).limit(limit).select("visits image description offerName _id").populate("restaurantId");
	}
	return {
		success: true,
		message: "Restaurant offers retrieved successfully",
		data: {
			restaurantOffers,
			page,
			limit,
			total: totalRestaurants,
		},
	};
};
