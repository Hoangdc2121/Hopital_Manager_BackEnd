import express from "express";
import { accountController } from "../../controllers/admin/accountController.js";
import { upload } from "../../common/cloudinary/initCloudinary.js";

const router = express.Router()

router.post('/createAccount',upload.single('avatar'),accountController.createAccount)
router.put('/updateInfoAccount/:accountId',upload.single('avatar'),accountController.updateInfoAccount)
router.put('/updateAccountStatus/:accountId',accountController.updateAccountStatus)
router.get('/getAllAcounts',accountController.getAllAcounts)
router.get('/getAllPatients',accountController.getAllPatients)
router.get('/getOverViewPatient',accountController.getOverViewPatient)
router.get('/getOverViewStaff',accountController.getOverViewStaff)
export default router