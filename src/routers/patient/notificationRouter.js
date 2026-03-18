import express from "express";
import { notificationController } from "../../controllers/patient/notificationController.js";

const router = express.Router()

router.get('/getAllNofication',notificationController.getAllNofications)
router.get('/getInfoNotifications/',notificationController.getInfoNotification)

export default router
