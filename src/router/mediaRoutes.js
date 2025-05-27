import express from "express";
import * as mediaController from "../controller/mediaController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";
import { mediaFileUpload } from "../utils/commonFunctions.js";

const router = express.Router();

router.post(
  "/addMedia",
  mediaFileUpload.fields([{ name: "image" }]),
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.addMedia
);

router.post(
  "/addVideoUrl",
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.addVideoUrl
);

router.get(
  "/getAllMedia/:type",
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.adminGetAllMedia
);

router.get("/getAllMedia/:type", authenticateUser, mediaController.getAllMedia);

router.delete(
  "/deleteMediaById/:id",
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.deleteMediaById
);

router.put(
  "/inActiveMediaById/:id",
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.inActiveMediaById
);

router.post(
  "/addSocialAccountURL",
  authenticateUser,
  authorizeUserRoles("admin"),
  mediaController.addSocialAccountURL
);

router.get(
  "/getSocialAccountURL",
  authenticateUser,
  mediaController.getSocialAccountURL
);

export default router;
