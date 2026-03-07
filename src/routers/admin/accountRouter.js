import express from "express";
import { accountController } from "../../controllers/admin/accountController.js";

const router = express.Router()

router.post('/createAccount',accountController.createAccount)
router.put('/updateInfoAccount/:accountId',accountController.updateInfoAccount)
router.put('/updateAccountStatus/:accountId',accountController.updateAccountStatus)
router.get('/getAllAcounts',accountController.getAllAcounts)
router.get('/getAllPatients',accountController.getAllPatients)
router.get('/getOverViewPatient',accountController.getOverViewPatient)
router.get('/getOverViewStaff',accountController.getOverViewStaff)
export default router