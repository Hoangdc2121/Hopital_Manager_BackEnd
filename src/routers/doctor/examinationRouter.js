import express from "express";
import { examinationController } from "../../controllers/doctor/examinationController.js";


const router = express.Router()

router.get('/getOverviewExamination',examinationController.getOverviewExamination)
router.get('/getAllExaminationDoctor/:scheduleId',examinationController.getAllExaminationDoctor)
router.post('/examinationPatient/:appointmentId',examinationController.examinationPatient)
router.get('/getInfoVitalSign/:appointmentId',examinationController.getInfoVitalSign)
router.post('/createMedicalRecord',examinationController.createMedicalRecord)
router.post('/createPrescriptionAndInvoice',examinationController.createPrescriptionAndInvoice)

export default router