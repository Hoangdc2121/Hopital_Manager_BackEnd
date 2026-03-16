import express from "express";
import { appointmentController } from "../../controllers/patient/appointmentController.js";

const router = express.Router()

router.get('/getAllDepartmentsSimple',appointmentController.getAllDepartmentsSimple)
router.get('/getAllDoctorsByDepartment/:departmentId',appointmentController.getAllDoctorsByDepartment)
router.get('/getAvailableSlots/:doctorId',appointmentController.getAvailableSlots)
router.post('/registerAppointment',appointmentController.registerAppointment)
router.get('/getAllAppointments',appointmentController.getAllAppointments)
router.post('/requestCancelAppointment/:appointmentId',appointmentController.requestCancelAppointment)
router.post('/requestAppointment/:appointmentId',appointmentController.requestAppointment)
router.get('/getHistoryRequestAppointment',appointmentController.getHistoryRequestAppointment)
export default router