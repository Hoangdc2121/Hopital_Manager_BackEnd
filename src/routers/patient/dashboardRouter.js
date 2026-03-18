import express from "express";
import { dahsboardController } from "../../controllers/patient/dashboardController.js";

const router = express.Router()

router.get('/getOverView', dahsboardController.getOverView)
router.get('/getAllAppointments', dahsboardController.getAllAppointments)
router.get('/getHistoryAppointments', dahsboardController.getHistoryAppointments)
router.get('/getTopDoctors', dahsboardController.getTopDoctors)
export default router