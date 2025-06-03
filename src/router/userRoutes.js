import { Router } from "express";
const router = Router();
// import { saveUserProfile } from '../utils/multerStorage.js';
import { register, login, profile, getUserById, getAllUsers, updateUser, addEmailShopNowButton, getEmailShopNowButton } from "../controller/userController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";
import { saveUserProfile, uploadEmailImages } from "../utils/multer.js";

router.post("/register", register); // user
router.post("/login", login); // user
router.get("/profile", authenticateUser, profile); // user
router.get("/admin/getUser/:id", authenticateUser, authorizeUserRoles("admin"), getUserById);


router.get("/admin/getAllUsers", authenticateUser, authorizeUserRoles('admin'), getAllUsers);
router.put("/updateUser/:id", saveUserProfile.single("profilePhoto"), authenticateUser, updateUser);

router.post('/admin/addEmailShopNowButton', uploadEmailImages, authenticateUser, authorizeUserRoles('admin'), addEmailShopNowButton); // admin add  url using email send 
router.get('/getEmailShopNowButton', getEmailShopNowButton); // using email send 

export default router;
