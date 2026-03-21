import express from "express";
import appointmentRouter from '../patient/appointmentRouter.js'
import dashboardRouter from '../patient/dashboardRouter.js'
import notificationRouter from '../patient/notificationRouter.js'
import profileRouter from '../patient/profileRouter.js'
import medicalRecordRouter from '../patient/medicalRecordRouter.js'
import paymentRouter from '../patient/paymentRouter.js'
import aiRouter from '../patient/aiRouter.js'
const router = express.Router()

router.use('/appointment',appointmentRouter)
router.use('/dashboard',dashboardRouter)
router.use('/notification',notificationRouter)
router.use('/profile',profileRouter)
router.use('/medicalRecord',medicalRecordRouter)
router.use('/payment',paymentRouter)
router.use('/ai',aiRouter)
export default router

