import { Router } from "express";
import { blockUser, getAllBlockedUsers, getAllUsers, getUserByBarcode, getUserById, getUserHistory } from "../controllers/users/users-controller";
import { createRestaurant, createRestaurantOffer, deleteRestaurant, getAllRestaurant, getAllRestaurantOffers, getRestaurantById, getRestaurantOfferById, updateRestaurant, updateRestaurantOffer } from "../controllers/restaurants/restaurants-controller";
import { createSettings, getSettings } from "../controllers/settings/settings-controller";
import { dashboardForAdmin } from "../controllers/admin/admin-controller";
import { createAchievement, deleteAchievement, getAchievementById, getAllAchievements, updateAchievement } from "../controllers/achievements/achievements-controller";
import { createCoupons, deleteCoupons, getAllCoupons, getCouponsById, updateCoupons } from "../controllers/coupons/coupons-controller";
import { getUserOfferHistory, postApplyUserOffer } from "../controllers/offers-history/offers-history-controller";
import { getUserCouponHistory, postApplyUserCoupon, updateCouponHistory } from "../controllers/coupons-history/coupons-history-controller";
import { getUserAchievementHistory, postApplyUserAchievements } from "../controllers/achievements-history/achievements-history-controller";

const router = Router();
//restaurants ROUTES
router.post("/restaurants", createRestaurant);
router.get("/restaurants", getAllRestaurant);
router.get("/restaurants/:id", getRestaurantById);
router.put("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

//restaurant-offers routes
router.post("/restaurants-offers", createRestaurantOffer);
router.get("/restaurants-offers", getAllRestaurantOffers);
router.get("/restaurants-offers/:id", getRestaurantOfferById);
router.put("/restaurants-offers/:id", updateRestaurantOffer);

//users ROUTES
router.get("/users", getAllUsers);
router.get("/blocked-users", getAllBlockedUsers);
router.get("/users/:id", getUserById);        
router.put("/block-user", blockUser);
router.get("/users/:id/history", getUserHistory);

//Acheivements ROUTES
router.post("/achievements", createAchievement);
router.get("/achievements", getAllAchievements);
router.get("/achievements/:id", getAchievementById);
router.put("/achievements/:id", updateAchievement);
router.delete("/achievements/:id", deleteAchievement);

//coupons ROUTES
router.post("/coupons", createCoupons);
router.get("/coupons", getAllCoupons);
router.get("/coupons/:id", getCouponsById);
router.put("/coupons/:id", updateCoupons);
router.delete("/coupons/:id", deleteCoupons);

//Settings
router.post("/settings", createSettings);
router.get("/settings", getSettings);

//dashboard 
router.get("/dashboard", dashboardForAdmin);
router.get("/user-barcode/:id", getUserByBarcode);

//user offer-history
router.get("/offer-history/:id", getUserOfferHistory);
router.post("/offer-history/apply", postApplyUserOffer);

//user achievement-history
router.get("/achievement-history/:id", getUserAchievementHistory);
// router.post("/achievement-history/apply", postApplyUserAchievements);

//user coupon-history
router.get("/coupon-history/:id", getUserCouponHistory);
router.put("/coupon-history/:id", updateCouponHistory);
router.post("/coupon-history/apply", postApplyUserCoupon);

export { router };