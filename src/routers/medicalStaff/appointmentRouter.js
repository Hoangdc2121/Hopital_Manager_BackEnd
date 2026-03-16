import express from "express";
import { appointmentController } from "../../controllers/medicalStaff/appointmentController.js";

const router = express.Router()

router.get('/getOverViewAppointment', appointmentController.getOverViewAppointment)
router.get('/getAllAppointments', appointmentController.getAllAppointments)
router.get('/getAllRequestAppointments', appointmentController.getAllRequestAppointments)
export default router