import express from 'express';
import { departmentController } from '../../controllers/admin/departmentController.js';

const router = express.Router();

router.post('/createDepartment', departmentController.createDepartment);
router.put('/updateDepartmentInfo/:departmentId',departmentController.updateDepartmentInfo);
router.put('/updateDepartmentStatus/:departmentId',departmentController.updateDepartmentStatus);
router.get('/getAllDepartments',departmentController.getAllDepartments)
router.get('/getAllDepartmentsSimple',departmentController.getAllDepartmentsSimple)

export default router;
