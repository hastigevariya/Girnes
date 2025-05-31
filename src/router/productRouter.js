import express from "express";
const router = express.Router();
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProduct, getPopularProducts } from "../controller/productController.js";
import { productImage } from "../utils/multer.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

router.post("/admin/createProduct", productImage.array("image", 5), authenticateUser, authorizeUserRoles('admin'), createProduct);
router.put("/admin/updateProduct/:id", productImage.fields([{ name: 'image' }]), authenticateUser, authorizeUserRoles('admin'), updateProduct);
router.delete("/admin/deleteProduct/:id", authenticateUser, authorizeUserRoles('admin'), deleteProduct);
router.get("/popularproducts", authenticateUser, authorizeUserRoles('admin'), getPopularProducts);

router.get("/getProductById/:id", authenticateUser, getProductById); // both
router.get("/getAllProduct", authenticateUser, getAllProducts);
router.get("/searchProduct/:searchProduct", authenticateUser, searchProduct);// both


export default router;
