import express from "express";
import { doctorController } from "../../controllers/admin/doctorController.js";

const router = express.Router()

router.get('/getAllDoctorsSimple',doctorController.getAllDoctorsSimple)
router.post('/createDoctorSchedule',doctorController.createDoctorSchedule)
router.put('/updateDoctorScheduleInfo/:doctorScheduleId',doctorController.updateDoctorScheduleInfo)
router.put('/updateDoctorScheduleStatus/:doctorScheduleId',doctorController.updateDoctorScheduleStatus)
router.get('/getAllDoctorSchedules',doctorController.getAllDoctorSchedules)
router.delete('/removeDoctorSchedule/:doctorScheduleId',doctorController.removeDoctorSchedule)
export default router
