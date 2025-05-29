import express from "express";
import {
  addCategory,
  getCategoryList,
  updateCategory,
  inActiveCategory
} from "../controller/categoryController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/admin/addCategory", authenticateUser, authorizeUserRoles('admin'), addCategory);
router.get("/admin/getCategoryList", authenticateUser, authorizeUserRoles('admin'), getCategoryList);
router.put("/admin/updateCategory/:categoryId", authenticateUser, authorizeUserRoles('admin'), updateCategory);
router.put("/admin/inActiveCategory/:categoryId", authenticateUser, authorizeUserRoles('admin'), inActiveCategory);
export default router;
