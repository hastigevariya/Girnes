import express from "express";
import * as mediaController from "../controller/mediaController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";
import { mediaFileUpload } from "../utils/commonFunctions.js";

const router = express.Router();

router.post("/admin/addMedia", mediaFileUpload.fields([{ name: "image" }]), authenticateUser, authorizeUserRoles("admin"), mediaController.addMedia);
router.post("/admin/addVideoUrl", authenticateUser, authorizeUserRoles("admin"), mediaController.addVideoUrl);

router.get("/admin/getAllMedia/:type", authenticateUser, authorizeUserRoles("admin"), mediaController.adminGetAllMedia);

router.get("/getAllMedia/:type", authenticateUser, mediaController.getAllMedia);

router.delete("/admin/deleteMediaById/:id", authenticateUser, authorizeUserRoles("admin"), mediaController.deleteMediaById);

router.put("/admin/inActiveMediaById/:id", authenticateUser, authorizeUserRoles("admin"), mediaController.inActiveMediaById);

// router.post("/addSocialAccountURL", authenticateUser, authorizeUserRoles("admin"), mediaController.addSocialAccountURL);

// router.get("/getSocialAccountURL", authenticateUser, mediaController.getSocialAccountURL);

export default router;
