import express from "express";
import {
  addCategory,
  getCategoryList,
  getPopularProducts,
} from "../controller/categoryController.js";
import { authenticateUser } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addCategory", authenticateUser, addCategory);
router.get("/getCategoryList", authenticateUser, getCategoryList);

router.get("/popular-products", getPopularProducts);

export default router;

// import express from "express";
// import { addProduct, getProductList } from "../controller/categoryController.js";
// import { authenticateUser } from "../middeleware/auth.js";

// const router = express.Router();

// router.post("/addProduct", authenticateUser, addProduct);
// router.get("/getProductList", authenticateUser, getProductList);

// export default router;
