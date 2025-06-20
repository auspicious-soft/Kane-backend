import { Router } from "express";
import { blockUser, deleteUser, getAllUsers, getCurrentUser, getUserById, updateUser } from "../controllers/users/users-controller";
import { createRestaurant, createRestaurantOffer, deleteRestaurant, getAllRestaurant, getAllRestaurantOffers, getRestaurantById, getRestaurantOfferById, updateRestaurant, updateRestaurantOffer } from "../controllers/restaurants/restaurants-controller";
import { logout } from "../controllers/auth/auth-controller";

const router = Router();
//current User ROUTES
router.get("/current-user", getCurrentUser);

//Settings Routes
router.delete("/delete-account/:id", deleteUser);
router.put("/update-profile/:id", updateUser);
router.post("/logout", logout);



export { router };
