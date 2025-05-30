import { Router } from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRouter.js";
import categoryRoutes from "./categoryRoutes.js";
import subcategoryRouter from "./subcategoryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import cartRoutes from "./cartRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import mediaRoutes from "./mediaRoutes.js";
import bannerRoutes from "./bannerRoutes.js";
import aboutRoutes from "./aboutRoutes.js"

const router = Router();
router.use("/auth", userRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/subcategory", subcategoryRouter);
router.use("/user/order", orderRoutes);
router.use("/user/cart", cartRoutes);
router.use("/user/wishlist", wishlistRoutes);
router.use("/media", mediaRoutes);
router.use("/banner", bannerRoutes);
router.use("/about", aboutRoutes)

export default router;
