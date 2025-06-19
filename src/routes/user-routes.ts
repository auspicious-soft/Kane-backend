import { Router } from "express";
import { getAllUsers, getCurrentUser, getUserById } from "../controllers/users/users-controller";
import { createRestaurant, createRestaurantOffer, deleteRestaurant, getAllRestaurant, getAllRestaurantOffers, getRestaurantById, getRestaurantOfferById, updateRestaurant, updateRestaurantOffer } from "../controllers/restaurants/restaurants-controller";

const router = Router();
//current User ROUTES
router.get("/current-user", getCurrentUser);



export { router };
