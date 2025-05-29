import express from "express";
const router = express.Router();
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProduct,
  getPopularProducts,
  //addDailyDeal
} from "../controller/productController.js";
import { productImage } from "../utils/multer.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

router.post(
  "/createProduct", productImage.array("image", 5), authenticateUser, authorizeUserRoles('admin'), createProduct);
router.get("/getAllProduct", authenticateUser, getAllProducts);
router.get("/getProductById/:id", authenticateUser, getProductById);

router.put("/updateProduct/:id", productImage.fields([{ name: 'image' }]), authenticateUser, authorizeUserRoles('admin'), updateProduct);


router.delete("/delete/:id", authenticateUser, authorizeUserRoles('admin'), deleteProduct);
router.get("/searchProduct/:searchProduct", authenticateUser, searchProduct);

router.get("/popularproducts", authenticateUser, authorizeUserRoles('admin'), getPopularProducts);

export default router;
