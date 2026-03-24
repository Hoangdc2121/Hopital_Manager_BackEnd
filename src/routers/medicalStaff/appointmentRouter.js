import express from "express";
import { appointmentController } from "../../controllers/medicalStaff/appointmentController.js";

const router = express.Router()
router.get('/getAllDoctors', appointmentController.getAllDoctors)
router.get('/getAllDoctorsByDepartment/:departmentId', appointmentController.getAllDoctorsByDepartment)
router.get('/getAvailableSlots/:doctorId', appointmentController.getAvailableSlots)
router.get('/getOverView', appointmentController.getOverView)
router.get('/getAllAppointments', appointmentController.getAllAppointments)

router.get('/getAllRequestAppointments', appointmentController.getAllRequestAppointments)
router.post('/confirmAppointment/:appointmentId', appointmentController.confirmAppointment)
router.post('/cancelAppointment/:appointmentId', appointmentController.cancelAppointment)
router.post('/changeAppointment/:appointmentId', appointmentController.changeAppointment)

router.post('/approveRequest/:requestId', appointmentController.approveRequest)
router.post('/rejectRequest/:requestId', appointmentController.rejectRequest)
router.get('/getAllAppointmentConfirm', appointmentController.getAllAppointmentConfirm)
router.post('/receptionAppointment/:appointmentId', appointmentController.receptionAppointment)
router.post('/notComeAppointment/:appointmentId', appointmentController.notComeAppointment)
router.get('/getAllAppointmentReception', appointmentController.getAllAppointmentReception)
router.post('/createVitalSign/:appointmentId', appointmentController.createVitalSign)
export default router