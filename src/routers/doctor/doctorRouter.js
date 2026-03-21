import express from "express";
import dashboardRouter from '../doctor/dashboardRouter.js'
import scheduleRouter from '../doctor/scheduleRouter.js'
import medicineRouter from '../doctor/medicineRouter.js'
import examinationRouter from '../doctor/examinationRouter.js'

const router = express.Router()

router.use('/dashboard',dashboardRouter)
router.use('/schedule',scheduleRouter)
router.use('/medicine',medicineRouter)
router.use('/examination',examinationRouter)

export default router