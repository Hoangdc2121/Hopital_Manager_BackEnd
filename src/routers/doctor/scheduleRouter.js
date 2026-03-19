import express from "express";
import { scheduleController } from "../../controllers/doctor/scheduleController.js";

const router = express.Router()

router.get('/getDoctorSchedule',scheduleController.getDoctorSchedule)

export default router