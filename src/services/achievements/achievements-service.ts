import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { achievementsModel } from "../../models/achievements/achievements-schema";
import { usersModel } from "../../models/users/users-schema";
import { UserVisitsModel } from "../../models/user-visits/user-visits";
import { RestaurantOffersModel } from "../../models/restaurant-offers/restaurant-offers-schema";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";


export const createAchievementsService = async (payload: any, res: Response) => {
  // if (!userId || !offerId || !type || !["earn", "redeem"].includes(type)) {
  //   return errorResponseHandler("All offer history fields are required", httpStatusCode.BAD_REQUEST, res);
  // }
  const achievement = await achievementsModel.create(payload);
  if (!achievement) {
    return errorResponseHandler("Failed to create achievement", httpStatusCode.INTERNAL_SERVER_ERROR, res);
  }
  return {
    success: true,
    message: "achievement created successfully",
    data: achievement
  };
};


export const getAllAchievementsService = async (res: Response) => {
  const achievements = await achievementsModel.find({isActive:true}).populate("assignRestaurant").sort({createdAt:-1});

  return {
    success: true,
    message: "Achievements retrieved successfully",
    data: achievements
  };
};

export const getAllRestaurantAchievementsService = async (res: Response) => {
  const restaurants = await RestaurantOffersModel.aggregate([
    // Step 1: Match only active offers
    { $match: { isActive: true } },

    // Step 2: Group by restaurantId and count offers
    {
      $group: {
        _id: "$restaurantId",
        offerCount: { $sum: 1 }
      }
    },

    // Step 3: Lookup restaurant details
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant"
      }
    },

    // Step 4: Unwind to flatten the array from lookup
    { $unwind: "$restaurant" },

    // Step 5: Merge restaurant fields and offerCount into root
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$restaurant", { offerCount: "$offerCount" }]
        }
      }
    }
  ]);

  return {
    success: true,
    message: "Restaurants retrieved successfully",
    data: restaurants
  };
};


// export const getAllRestaurantAchievementsService = async (res: Response) => {
//   const restaurants = await RestaurantOffersModel.aggregate([
//     { $match: { isActive: true } },
//     {
//       $group: {
//         _id: "$restaurantId" // Group by restaurant
//       }
//     },
//     {
//       $lookup: {
//         from: "restaurants",           // The collection name in MongoDB
//         localField: "_id",
//         foreignField: "_id",
//         as: "restaurant"
//       }
//     },
//     { $unwind: "$restaurant" },
//     {
//       $replaceRoot: {
//         newRoot: "$restaurant" // Flatten the result
//       }
//     }
//   ]);

//   return {
//     success: true,
//     message: "Restaurants retrieved successfully",
//     data: restaurants
//   };
// };

export const getAchievementsByIdService = async (achievementId: string, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const achievements = await achievementsModel.findById(achievementId);

  if (!achievements) {
    return errorResponseHandler("Achievements not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement retrieved successfully",
    data: achievements
  };
};
export const getUserStampsByRestaurantIdService = async (userData: any, restaurantId: string, res: Response) => {
  if (!restaurantId) {
    return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const stamps = await UserVisitsModel.find({ restaurantId: restaurantId, userId: userData.id }).populate("restaurantId").sort({createdAt:-1});

  if (!stamps) {
    return errorResponseHandler("Stamps not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Stamps retrieved successfully",
    data: stamps
  };
};
export const getUserVisitsService = async (userData: any, payload: any, res: Response) => {
  const { restaurantId } = payload;
  let visits;
  if (restaurantId) {
     visits = await UserVisitsModel.find({ restaurantId: restaurantId, userId: userData.id }).populate("restaurantId").sort({createdAt:-1});
  } else {
     visits = await UserVisitsModel.find({ userId: userData.id }).populate("restaurantId").sort({createdAt:-1});
  }

  if (!visits) {
    return errorResponseHandler("Visits not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Visits retrieved successfully",
    data: visits
  };
};
export const getAchievementsByRestaurantIdService = async (userData: any, restaurantId: string, res: Response) => {
  if (!restaurantId) {
    return errorResponseHandler("Restaurant ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const restaurant = await RestaurantOffersModel.find({ restaurantId: restaurantId }).populate("restaurantId").sort({createdAt:-1});

  if (!restaurant) {
    return errorResponseHandler("Restaurant not found", httpStatusCode.NOT_FOUND, res);
  }
 const user = await usersModel.findById(userData.id);

 if (!user) {
    return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
 }
  const visitEntry = user.visitData.find((visit: any) =>
    visit.restaurantId?.toString() === restaurantId
  );

  const currentVisitStreak = visitEntry?.currentVisitStreak || 0;

  return {
    success: true,
    message: "Achievement retrieved successfully",
    data: {
      restaurant,
      currentVisitStreak,
    }
  };
};


export const updateAchievementService = async (achievementId: string, payload: any, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const updatedAchievement = await achievementsModel.findByIdAndUpdate(
    achievementId,
    { ...payload },
    { new: true }
  );

  if (!updatedAchievement) {
    return errorResponseHandler("Achievement not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement updated successfully",
    data: updatedAchievement
  };
};

export const deleteAchievementService = async (achievementId: string, res: Response) => {
  if (!achievementId) {
    return errorResponseHandler("Achievement ID is required", httpStatusCode.BAD_REQUEST, res);
  }
  const deletedAchievement = await achievementsModel.findByIdAndUpdate(achievementId, {isActive:false});

  if (!deletedAchievement) {
    return errorResponseHandler("Achievement not found", httpStatusCode.NOT_FOUND, res);
  }

  return {
    success: true,
    message: "Achievement deleted successfully",
    data: deletedAchievement
  };
};