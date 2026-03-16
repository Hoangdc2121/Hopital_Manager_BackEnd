import express from "express";
import appointmentRouter from '../patient/appointmentRouter.js'
import dashboardRouter from '../patient/dashboardRouter.js'
const router = express.Router()

router.use('/appointment',appointmentRouter)
router.use('/dashboard',dashboardRouter)

export default router

