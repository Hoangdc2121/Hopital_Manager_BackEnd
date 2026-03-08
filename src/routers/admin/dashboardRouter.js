import express from "express";
import { dashboardController } from "../../controllers/admin/dashboardController.js";

const router = express.Router()

router.get('/getOverView',dashboardController.getOverView)
router.get('/getRevenueAndAppointmentsChart',dashboardController.getRevenueAndAppointmentsChart)
router.get('/getAppointmentByDepartment',dashboardController.getAppointmentByDepartment)
router.get('/getTopDoctors',dashboardController.getTopDoctors)
router.get('/getDepartmentStats',dashboardController.getDepartmentStats)
router.get('/getAllAppointments',dashboardController.getAllAppointments)

export default router