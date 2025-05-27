import express from "express";
const router = express.Router();

import {
  addWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controller/wishlistController.js";
import { authenticateUser } from "../middeleware/auth.js";

router.post("/addWishlist", authenticateUser, addWishlist);
router.get("/getWishlist", authenticateUser, getWishlist);
router.delete(
  "/removeFromWishlist/:productId",
  authenticateUser,
  removeFromWishlist
);

export default router;
