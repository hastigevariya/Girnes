import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  deleteCartByProductId,
} from "../controller/cartController.js";
import { authenticateUser } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addToCart", authenticateUser, addToCart);
router.get("/getUserCart", authenticateUser, getUserCart);
router.put("/updateCart/:productId", authenticateUser, updateCart);

router.delete(
  "/deleteCartByProductId/:productId",
  authenticateUser,
  deleteCartByProductId
);

export default router;
