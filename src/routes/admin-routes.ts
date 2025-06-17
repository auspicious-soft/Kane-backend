import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/users/users-controller";
import { createRestaurant, createRestaurantOffer, deleteRestaurant, getAllRestaurant, getAllRestaurantOffers, getRestaurantById, getRestaurantOfferById, updateRestaurant, updateRestaurantOffer } from "../controllers/restaurants/restaurants-controller";

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

export { router };
