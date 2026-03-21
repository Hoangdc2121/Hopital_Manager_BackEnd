import express from "express";
import { paymentController } from "../../controllers/patient/paymentController.js";

const router = express.Router()

router.get('/getHistoryPayments',paymentController.getHistoryPayments)

export default router