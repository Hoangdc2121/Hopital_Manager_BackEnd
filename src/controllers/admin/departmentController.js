import { responseSuccess } from "../../common/helpers/response.helper.js";
import { departmentService } from "../../services/admin/departmentService.js";


export const departmentController = {
    createDepartment: async (req, res, next) => {
        try {
            const data = await departmentService.createDepartment(req.body);
            const response = responseSuccess(data, "Tạo khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo khoa thất bại", err)
            next(err)
        }
    },
    updateDepartmentInfo: async (req, res, next) => {
        try {
            const departmentId = req.params.departmentId;
            const data = await departmentService.updateDepartmentInfo(departmentId, req.body);
            const response = responseSuccess(data, "Cập nhật thông tin khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật thông tin khoa thất bại", err)
            next(err)
        }
    },
    updateDepartmentStatus: async (req, res, next) => {
        try {
            const departmentId = req.params.departmentId;
            const data = await departmentService.updateDepartmentStatus(departmentId);
            const response = responseSuccess(data, "Cập nhật trạng thái khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật trạng thái khoa thất bại", err)
            next(err)
        }
    },
    getAllDepartments: async (req, res, next) => {
        try {
            const search = req.query.search || "";
            const page = req.query.page || 1;
            const data = await departmentService.getAllDepartments(search, page);
            const response = responseSuccess(data, "Lấy danh sách khoa có phân trang thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khoa có phân trang thất bại", err)
            next(err)
        }
    },
    getAllDepartmentsSimple: async (req, res, next) => {
        try {
            const data = await departmentService.getAllDepartmentsSimple();
            const response = responseSuccess(data, "Lấy danh sách khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khoa thất bại", err)
            next(err)
        }
    }
}