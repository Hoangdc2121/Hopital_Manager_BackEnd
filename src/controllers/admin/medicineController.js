import { responseSuccess } from "../../common/helpers/response.helper.js"
import { medicineService } from "../../services/admin/medicineService.js"

export const medicineController = {
    createMedicine: async (req, res, next) => {
        try {
            const data = await medicineService.createMedicine(req.body)
            const response = responseSuccess(data, 'Tạo thuốc thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo thuốc thất bại', err)
            next(err)
        }
    },
    updateInfoMedicine: async (req, res, next) => {
        try {
            const medicineId = req.params.medicineId
            const data = await medicineService.updateInfoMedicine(medicineId,req.body)
            const response = responseSuccess(data, 'Cập nhật thông tin thuốc thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông tin thuốc thất bại', err)
            next(err)
        }
    }, 
    updateMedicineStatus: async (req, res, next) => {
         try {
            const medicineId = req.params.medicineId
            const data = await medicineService.updateMedicineStatus(medicineId)
            const response = responseSuccess(data, 'Cập nhật trạng thái thuốc thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái thuốc thất bại', err)
            next(err)
        }
    }, 
    getAllMedicines: async (req, res, next) => {
         try {
            const search = req.query.search || ""
            const page = req.query.page || 1
            const data = await medicineService.getAllMedicines(search,page)
            const response = responseSuccess(data, 'Lấy danh sách thuốc có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách thuốc có phân trang thất bại', err)
            next(err)
        }
    }, 
    getAllMedicinesSimple: async (req, res, next) => {
        try {
            const data = await medicineService.getAllMedicinesSimple()
            const response = responseSuccess(data, 'Lấy danh sách thuốc thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách thuốc thất bại', err)
            next(err)
        }
    },
}