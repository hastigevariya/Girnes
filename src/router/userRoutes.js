import { Router } from "express";
const router = Router();
// import { saveUserProfile } from '../utils/multerStorage.js';
import {
  register,
  login,
  profile,
  getAllUsers,
  updateUser,
} from "../controller/userController.js";
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";
import { saveUserProfile } from "../utils/multer.js";

router.post("/register", register); // user
router.post("/login", login); // user
router.post("/profile", authenticateUser, profile); // user

router.get("/admin/getAllUsers", authenticateUser, authorizeUserRoles('admin'), getAllUsers);
router.put("/updateUser/:id", saveUserProfile.single("profilePhoto"), authenticateUser, updateUser);

export default router;
