import express from "express";
import { addContactUs, getAllCustomerQuerysList, addCompanyinfo, getCompanyinfo } from '../controller/contactController.js';
import { authenticateUser, authorizeUserRoles } from "../middeleware/auth.js";

const router = express.Router();

router.post("/admin/addContactUs", authenticateUser, authorizeUserRoles('admin'), addContactUs);
router.get("/getContactUs", authenticateUser, getAllCustomerQuerysList);

router.post("/admin/addCompanyinfo", authenticateUser, authorizeUserRoles('admin'), addCompanyinfo);
router.get("/getCompanyinfo", authenticateUser, getCompanyinfo);

export default router;
