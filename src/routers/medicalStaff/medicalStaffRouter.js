import express from "express";

import appointmentRouter from '../medicalStaff/appointmentRouter.js'
const router = express.Router()

router.use('/appointment',appointmentRouter)

export default router