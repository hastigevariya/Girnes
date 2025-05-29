import express from "express";
import {
  addCategory,
  getCategoryList,
} from "../controller/categoryController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addCategory", authenticateUser, authorizeUserRoles('admin'), addCategory);
router.get("/getCategoryList", authenticateUser, authorizeUserRoles('admin'), getCategoryList);

export default router;

// import express from "express";
// import { addProduct, getProductList } from "../controller/categoryController.js";
// import { authenticateUser } from "../middeleware/auth.js";

// const router = express.Router();

// router.post("/addProduct", authenticateUser, addProduct);
// router.get("/getProductList", authenticateUser, getProductList);

// export default router;
