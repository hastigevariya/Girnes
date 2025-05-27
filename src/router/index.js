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

const router = Router();

router.use("/user", userRoutes);
router.use("/admin/product", productRoutes);
router.use("/admin/category", categoryRoutes);
router.use("/admin/subcategory", subcategoryRouter);
router.use("/user/order", orderRoutes);
router.use("/user/cart", cartRoutes);
router.use("/user/wishlist", wishlistRoutes);
router.use("/admin/media", mediaRoutes);
router.use("/admin/banner", bannerRoutes);

export default router;
