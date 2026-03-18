import express from 'express'
import { medicalRecordController } from '../../controllers/patient/medicalRecordController.js'

const router = express.Router()

router.get('/getAllAppointmentsSucces',medicalRecordController.getAllAppointmentsSucces)
router.get('/getMedicalRecordByAppointment/:appointmentId',medicalRecordController.getMedicalRecordByAppointment)

export default router