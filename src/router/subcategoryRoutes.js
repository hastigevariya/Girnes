import express from "express";
import {
  addSubCategory,
  getSubCategoryList,
} from "../controller/subcategoryController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addSubCategory", authenticateUser, authorizeUserRoles('admin'), addSubCategory);
router.get("/getSubCategoryList", authenticateUser, authorizeUserRoles('admin'), getSubCategoryList);

export default router;
