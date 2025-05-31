// reviewRoutes.js
import express from "express";
import * as reviewController from "../controller/reviewController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addReview", authenticateUser, reviewController.addReview); // user

router.delete("/admin/inActiveReview/:id", authenticateUser, authorizeUserRoles("admin"), reviewController.inActiveReview); // admin

export default router;
