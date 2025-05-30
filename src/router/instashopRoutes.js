import express from "express";
import { addInstaShop, getAllInstaShops, updateInstaShopStatus } from "../controller/instashopController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";
import { bannerImageUpload } from "../utils/commonFunctions.js";

const router = express.Router();

router.post("/admin/addInstaShop", bannerImageUpload.single("image"), authenticateUser, authorizeUserRoles("admin"), addInstaShop);
router.get("/getInstaShops", authenticateUser, getAllInstaShops);
router.put("/updateInstaShopStatus/:id", updateInstaShopStatus);

export default router;
