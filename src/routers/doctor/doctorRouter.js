import express from "express";
import dashboardRouter from '../doctor/dashboardRouter.js'
import scheduleRouter from '../doctor/scheduleRouter.js'

const router = express.Router()

router.use('/dashboard',dashboardRouter)
router.use('/schedule',scheduleRouter)

export default router