import express from "express";
import {
  addSubCategory,
  getSubCategoryList,
} from "../controller/subcategoryController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/admin/addSubCategory", authenticateUser, authorizeUserRoles('admin'), addSubCategory);
router.get("/admin/getSubCategoryList", authenticateUser, authorizeUserRoles('admin'), getSubCategoryList);

export default router;
