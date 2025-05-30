import express from "express";
const router = express.Router();

import { addBanner, getAllBanner, adminGetAllBanner, deleteBannerById, inActiveBannerById, } from "../controller/bannerController.js";

import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

import { bannerImageUpload } from "../utils/commonFunctions.js";

router.post("/admin/addBanner", bannerImageUpload.single("image"), authenticateUser, authorizeUserRoles("admin"), addBanner); // admin

router.get("/getAllBanner", authenticateUser, getAllBanner); // user

router.get("/admin/getAllBanner", authenticateUser, authorizeUserRoles("admin"), adminGetAllBanner); // admin

router.delete("/admin/deleteBannerById/:id", authenticateUser, authorizeUserRoles("admin"), deleteBannerById); // admin

router.put("/admin/inActiveBannerById/:id", authenticateUser, authorizeUserRoles("admin"), inActiveBannerById); // admin

export default router;
