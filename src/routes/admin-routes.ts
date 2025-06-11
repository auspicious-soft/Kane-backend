import { Router } from "express";


import { getAllUsers, getUserById } from "../controllers/users/users-controller";
import { checkWebAuth } from "../middleware/check-auth";

const router = Router();

// router.get("/", checkWebAuth, getAdminDetails);
// // router.get("/dashboard", getDashboardStats);

// //users routes
// router.route("/users").get(getAllUsers);
// router.route("/users/:id").get(getUserById);


export { router };
