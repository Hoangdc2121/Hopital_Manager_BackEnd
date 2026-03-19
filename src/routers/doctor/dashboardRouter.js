import express from "express";
import { dashboardController } from "../../controllers/doctor/dashboardController.js";

const router = express.Router()

router.get('/getAppointmentComming',dashboardController.getAppointmentComming)
router.get('/getHistoryAppointment',dashboardController.getHistoryAppointment)

export default router