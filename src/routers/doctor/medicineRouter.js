import express from "express";
import { medicineController } from "../../controllers/doctor/medicineController.js";

const router = express.Router()

router.get('/getAllMedicine',medicineController.getAllMedicine)

export default router