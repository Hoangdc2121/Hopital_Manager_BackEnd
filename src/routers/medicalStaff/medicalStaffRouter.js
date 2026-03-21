import express from "express";

import appointmentRouter from '../medicalStaff/appointmentRouter.js'
import invoiceRouter from '../medicalStaff/invoiceRouter.js'
const router = express.Router()

router.use('/appointment',appointmentRouter)
router.use('/invoice',invoiceRouter)

export default router