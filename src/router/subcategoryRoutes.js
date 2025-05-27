import express from "express";
import {
  addSubCategory,
  getSubCategoryList,
} from "../controller/subcategoryController.js";
import { authenticateUser } from "../middeleware/auth.js";

const router = express.Router();

router.post("/addSubCategory", authenticateUser, addSubCategory);
router.get("/getSubCategoryList", authenticateUser, getSubCategoryList);

export default router;
