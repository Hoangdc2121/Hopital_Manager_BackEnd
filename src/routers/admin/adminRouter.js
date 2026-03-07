import express from "express";
import departmentRouter from '../admin/departmentRouter.js'
import accountRouter from '../admin/accountRouter.js'
const router = express.Router()

router.use('/department',departmentRouter)
router.use('/account',accountRouter)
export default router