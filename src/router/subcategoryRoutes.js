import express from "express";
import { addSubCategory, getSubCategoryList, updateSubCategory, inActiveSubCategory } from "../controller/subcategoryController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/admin/addSubCategory", authenticateUser, authorizeUserRoles('admin'), addSubCategory);
router.get("/admin/getSubCategoryList", authenticateUser, authorizeUserRoles('admin'), getSubCategoryList);
router.put("/admin/updateSubCategory/:subCategoryId", authenticateUser, authorizeUserRoles('admin'), updateSubCategory);
router.put("/admin/inActiveSubCategory/:subCategoryId", authenticateUser, authorizeUserRoles('admin'), inActiveSubCategory);


export default router;
