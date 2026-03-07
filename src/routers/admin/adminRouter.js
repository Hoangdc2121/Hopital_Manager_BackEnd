import express from "express";
import departmentRouter from '../admin/departmentRouter.js'
import accountRouter from '../admin/accountRouter.js'
import medicineRouter from '../admin/medicineRouter.js'
const router = express.Router()

router.use('/department',departmentRouter)
router.use('/account',accountRouter)
router.use('/medicine',medicineRouter)
export default router