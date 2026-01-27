import { Router } from "express";
import {  changePassword, deleteUser, getAllSpinPrizesList, getAllUsers, getCurrentUser, getSpinPrizes, getTopLeaders, getUserById, getUserHistory, getUserHistoryForUser, getUserPointHistory, inviteCodeAndReferredDetails, updateUser, uploadUserImageController, userHomePage } from "../controllers/users/users-controller";
import {  getAllRestaurantForUser, getAllRestaurantOfferForUser, getRestaurantOfferById } from "../controllers/restaurants/restaurants-controller";
import { logout } from "../controllers/auth/auth-controller";
import { collectAchievement, createOfferHistory, getUserOfferHistoryForUser } from "../controllers/offers-history/offers-history-controller";
// import { createPointsHistory } from "../controllers/points-history/points-history-controller";
import { createCouponsHistory, getUserEarnedCouponHistory, getUserRedeemCouponHistory, updateCouponStatus } from "../controllers/coupons-history/coupons-history-controller";
import { getAchievementsByRestaurantId, getAllRestaurantAchievements, getUserStampsByRestaurantId, getUserVisits } from "../controllers/achievements/achievements-controller";
import { updateCouponStatusService } from "../services/coupons-history/coupons-history-service";
import { getAllNotificationsOfUser, markAllNotificationsAsRead, markNotificationsAsRead, sendNotificationToUser } from "../controllers/notifications/notifications-controller";

const router = Router();
//current User ROUTES
router.get("/current-user", getCurrentUser);

//Settings Routes
router.delete("/delete-account/:id", deleteUser);
router.patch("/update-profile/:id", updateUser);
router.post("/logout", logout);

//  //restaurants ROUTES
router.post("/offer-history", createOfferHistory);
router.get("/offer-history", getUserOfferHistoryForUser);
router.post("/coupon-history", createCouponsHistory);
router.get("/coupon-history", getUserRedeemCouponHistory);
router.get("/visit-history", getUserVisits);
// router.post("/points-history", createPointsHistory);
router.get("/user-history", getUserHistoryForUser);


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
router.post("/collect-stamps", collectAchievement);
// router.get("/users/:id", getUserById);

//coupon routes
router.get("/coupons", getUserEarnedCouponHistory);
router.put("/coupons-scratch/:id", updateCouponStatus);
//spin prizes
router.post("/spin-prizes", getSpinPrizes);
router.get("/spin-prizes", getAllSpinPrizesList);

//notification routes
router.get("/notifications", getAllNotificationsOfUser);
router.post("/notifications", sendNotificationToUser);
router.put("/notifications/mark-all-read", markAllNotificationsAsRead);
router.put("/notifications/mark-read/:id", markNotificationsAsRead);



export { router };
