import { Router } from "express";
import {  changePassword, deleteUser, getAllUsers, getCurrentUser, getTopLeaders, getUserById, getUserPointHistory, inviteCodeAndReferredDetails, updateUser, uploadUserImageController, userHomePage } from "../controllers/users/users-controller";
import {  getAllRestaurantForUser, getAllRestaurantOfferForUser, getRestaurantOfferById } from "../controllers/restaurants/restaurants-controller";
import { logout } from "../controllers/auth/auth-controller";
import { createOfferHistory } from "../controllers/offers-history/offers-history-controller";
import { createPointsHistory } from "../controllers/points-history/points-history-controller";
import { createCouponsHistory } from "../controllers/coupons-history/coupons-history-controller";
import { getAchievementsByRestaurantId, getAllRestaurantAchievements, getUserStampsByRestaurantId } from "../controllers/achievements/achievements-controller";
import { createAchievementHistory } from "../controllers/achievements-history/achievements-history-controller";

const router = Router();
//current User ROUTES
router.get("/current-user", getCurrentUser);

//Settings Routes
router.delete("/delete-account/:id", deleteUser);
router.patch("/update-profile/:id", updateUser);
router.post("/logout", logout);

//  //restaurants ROUTES
router.post("/offer-history", createOfferHistory);
router.post("/coupon-history", createCouponsHistory);
router.post("/points-history", createPointsHistory);

// Settings routes
router.put("/change-password", changePassword);

//Home page routes
router.get("/home", userHomePage);
router.get("/invite-friends", inviteCodeAndReferredDetails);
router.get("/restaurants", getAllRestaurantForUser);
router.get("/restaurant-offers", getAllRestaurantOfferForUser);
router.get("/restaurant-offers/:id", getRestaurantOfferById);

//user Points-History routes
router.get("/points-history", getUserPointHistory);
//user top-leaders routes
router.get("/top-leaders", getTopLeaders);

//upload-profile-pic
router.post("/upload-image", uploadUserImageController);

//Acheivements ROUTES
router.get("/achievements/restaurants", getAllRestaurantAchievements);
router.get("/achievements/restaurants/:id", getAchievementsByRestaurantId);
router.get("/stamps/restaurants/:id", getUserStampsByRestaurantId);
router.post("/collect-stamps", createAchievementHistory);
// router.get("/users/:id", getUserById);





export { router };
