import express from "express";
import { medicineController } from "../../controllers/admin/medicineController.js";

const router = express.Router()

router.post('/createMedicine',medicineController.createMedicine)
router.put('/updateInfoMedicine/:medicineId',medicineController.updateInfoMedicine)
router.put('/updateMedicineStatus/:medicineId',medicineController.updateMedicineStatus)
router.get('/getAllMedicines',medicineController.getAllMedicines)
router.get('/getAllMedicinesSimple',medicineController.getAllMedicinesSimple)

export default router