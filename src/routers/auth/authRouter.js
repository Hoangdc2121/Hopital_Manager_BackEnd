import express from "express";
import { authController } from "../../controllers/auth/authController.js";

const router = express.Router()

router.post('/registerAdmin',authController.registerAdmin)
router.post('/registerPatient',authController.registerPatient)
router.post('/login',authController.login)
export default router