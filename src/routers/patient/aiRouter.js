import express from "express";
import { aiController } from "../../controllers/patient/aiController.js";


const router = express.Router()

router.get('/aiMessage',aiController.aiMessage)

export default router