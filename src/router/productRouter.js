import express from "express";
const router = express.Router();
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProduct,
} from "../controller/productController.js";
import { productImage } from "../utils/multer.js";

router.post(
  "/createProduct",
  productImage.fields([{ name: "image" }]),
  createProduct
);
router.get("/getAllProduct", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/searchProduct/:searchProduct", searchProduct);

export default router;

// import express from "express";
// const router = express.Router();

// import {
//   createSubcategory,
//   getAllSubcategories,
//   getSubcategoryById,
//   updateSubcategory,
//   deleteSubcategory,
//   searchSubcategory,
// } from "../controller/productController.js";

// import { productImage } from "../utils/multer.js"; // Assuming subcategory uses image upload too

// router.post(
//   "/createSubcategory",
//   productImage.fields([{ name: "image" }]),
//   createSubcategory
// );

// router.get("/getAllSubcategories", getAllSubcategories);
// router.get("/getSubcategoryById/:id", getSubcategoryById);
// router.put("/update/:id", updateSubcategory);
// router.delete("/delete/:id", deleteSubcategory);
// router.get("/searchSubcategory/:searchTerm", searchSubcategory);

// export default router;
