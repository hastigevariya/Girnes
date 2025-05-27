import express from "express";
import {
  placeOrder,
  getAllUserOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
} from "../controller/orderController.js";
import { authenticateUser } from "../middeleware/auth.js";

const router = express.Router();

router.post("/placeOrder", authenticateUser, placeOrder);
router.get("/getAllOrders", authenticateUser, getAllUserOrders);
router.get("/getOrderById/:id", authenticateUser, getOrderById);
router.put("/updateOrder/:id", authenticateUser, updateOrder);
router.put("/cancelOrder/:id", authenticateUser, cancelOrder);

export default router;
