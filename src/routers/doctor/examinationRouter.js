import express from "express";
import { examinationController } from "../../controllers/doctor/examinationController.js";


const router = express.Router()

router.get('/getOverviewExamination',examinationController.getOverviewExamination)
router.get('/getAllExaminationDoctor/:scheduleId',examinationController.getAllExaminationDoctor)
router.post('/examinationPatient/:appointmentId',examinationController.examinationPatient)
router.get('/getInfoVitalSign/:appointmentId',examinationController.getInfoVitalSign)
router.post('/createMedicalRecord/:appointmentId',examinationController.createMedicalRecord)
router.post('/createPrescriptionAndInvoice/:medicalRecordId',examinationController.createPrescriptionAndInvoice)
router.get('/getAllMedicalRecordDetail/:medicalRecordId',examinationController.getAllMedicalRecordDetail)
export default router