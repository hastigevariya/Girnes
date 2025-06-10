import express from "express";
const router = express.Router();
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProduct, getPopularProducts, downloadAddBulkProductTemplate, uploadBulkProductsFile } from "../controller/productController.js";
import { productImage, uploadExcelFile } from "../utils/multer.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

router.post("/admin/createProduct", productImage.array("image", 5), authenticateUser, authorizeUserRoles('admin'), createProduct);
router.put("/admin/updateProduct/:id", productImage.fields([{ name: 'image' }]), authenticateUser, authorizeUserRoles('admin'), updateProduct);
router.delete("/admin/deleteProduct/:id", authenticateUser, authorizeUserRoles('admin'), deleteProduct);
router.get("/popularproducts", authenticateUser, authorizeUserRoles('admin'), getPopularProducts);

router.get("/getProductById/:id", authenticateUser, getProductById); // both
router.get("/getAllProduct", authenticateUser, getAllProducts);
router.get("/searchProduct/:searchProduct", authenticateUser, searchProduct);// both

router.get('/admin/downloadAddBulkProductTemplate', authenticateUser, authorizeUserRoles("admin"), downloadAddBulkProductTemplate); // admin
router.get('/uploadBulkProductsFile', [uploadExcelFile.single('file'),], authenticateUser, authorizeUserRoles("admin"), uploadBulkProductsFile); // admin


export default router;
