import { Router } from "express";
import { blockUser, getAllBlockedUsers, getAllUsers, getUserById, getUserHistory } from "../controllers/users/users-controller";
import { createRestaurant, createRestaurantOffer, deleteRestaurant, getAllRestaurant, getAllRestaurantOffers, getRestaurantById, getRestaurantOfferById, updateRestaurant, updateRestaurantOffer } from "../controllers/restaurants/restaurants-controller";
import { createSettings, getSettings } from "../controllers/settings/settings-controller";
import { dashboardForAdmin } from "../controllers/restaurants copy/restaurants-controller";

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

//Settings
router.post("/settings", createSettings);
router.get("/settings", getSettings);

//dashboard 
router.get("/dashboard", dashboardForAdmin);



export { router };
