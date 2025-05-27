import express from "express";
const router = express.Router();

import {
  addBanner,
  getAllBanner,
  adminGetAllBanner,
  deleteBannerById,
  inActiveBannerById,
} from "../controller/bannerController.js";

import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

import { bannerImageUpload } from "../utils/commonFunctions.js";

router.post(
  "/addBanner",
  bannerImageUpload.single("image"),
  authenticateUser,
  authorizeUserRoles("admin"),
  addBanner
); // admin

router.get("/getAllBanner", authenticateUser, getAllBanner); // user

router.get(
  "/adminGetAllBanner",
  authenticateUser,
  authorizeUserRoles("admin"),
  adminGetAllBanner
); // admin

router.delete(
  "/deleteBannerById/:id",
  authenticateUser,
  authorizeUserRoles("admin"),
  deleteBannerById
); // admin

router.put(
  "/inActiveBannerById/:id",
  authenticateUser,
  authorizeUserRoles("admin"),
  inActiveBannerById
); // admin

export default router;
