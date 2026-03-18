import express from "express";
import { profileController } from "../../controllers/patient/profileController.js";
import { upload } from "../../common/cloudinary/initCloudinary.js";

const router = express.Router()

router.get('/getInfoPatient',profileController.getInfoPatient)
router.put('/updateInfoPatient',upload.single('avatar'),profileController.updateInfoPatient)
router.put('/resetPassword',profileController.resetPassword)

export default router