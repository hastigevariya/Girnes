import express from "express";
import { addAbout, getAbout } from "../controller/aboutController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

import { bannerImageUpload } from "../utils/commonFunctions.js";

router.post("/admin/addAbout", bannerImageUpload.single("image"), authenticateUser, authorizeUserRoles("admin"), addAbout);
router.get("/getAbout", authenticateUser, authorizeUserRoles, getAbout);

export default router;
