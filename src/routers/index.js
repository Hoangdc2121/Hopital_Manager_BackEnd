import express from "express";
import authRouter from '../routers/auth/authRouter.js'
import adminRouter from '../routers/admin/adminRouter.js'
import patientRouter from '../routers/patient/patientRouter.js'
import authMiddleware from "../common/middlewares/authMiddleware.js";
import medicalStaffRouter from '../routers/medicalStaff/medicalStaffRouter.js'
import doctorRouter from '../routers/doctor/doctorRouter.js'
import { validateAdmin, validateDoctor, validateMedicalStaff, validatePatient } from "../common/middlewares/validateRole.js";
const router = express.Router()

router.use('/api/auth',authRouter)
router.use('/api/admin',authMiddleware,validateAdmin,adminRouter)
router.use('/api/patient',authMiddleware,validatePatient,patientRouter)
router.use('/api/medicalStaff',authMiddleware,validateMedicalStaff,medicalStaffRouter)
router.use('/api/doctor',authMiddleware,validateDoctor,doctorRouter)

export default router