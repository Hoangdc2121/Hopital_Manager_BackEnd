import { responseSuccess } from "../../common/helpers/response.helper.js"
import { accountService } from "../../services/admin/accountService.js"

export const accountController = {
    createAccount: async (req, res, next) => {
        try {
            const avatarPath = req.file?.path;
            const data = await accountService.createAccount(req.body, avatarPath)
            const response = responseSuccess(data, 'Tạo tài khoản thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo tài khoản thất bại', err)
            next(err)
        }
    },
    updateInfoAccount: async (req, res, next) => {
        try {
            const accountId = req.params.accountId
            const avatarPath = req.file?.path;
            const data = await accountService.updateInfoAccount(accountId, req.body, avatarPath)
            const response = responseSuccess(data, 'Cập nhật thông tin tài khoản thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông tin tài khoản thất bại', err)
            next(err)
        }
    },
    updateAccountStatus: async (req, res, next) => {
        try {
            const accountId = req.params.accountId
            const data = await accountService.updateAccountStatus(accountId)
            const response = responseSuccess(data, 'Cập nhật trạng thái tài khoản thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái tài khoản thất bại', err)
            next(err)
        }
    },
    getAllAcounts: async (req, res, next) => {
        try {
            const adminId = req.user.id
            const search = req.query.search || ""
            const role = req.query.role || ""
            const page = req.query.page || 1
            const data = await accountService.getAllAcounts(adminId, role, search, page)
            const response = responseSuccess(data, 'Lấy danh sách tài khoản có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách tài khoản có phân trang thất bại', err)
            next(err)
        }
    },
    getAllPatients: async (req, res, next) => {
        try {
            const search = req.query.search || ""
            const gender = req.query.gender || ""
            const page = req.query.page || 1
            const data = await accountService.getAllPatients(search, gender, page)
            const response = responseSuccess(data, 'Lấy danh sách bệnh nhân có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách bệnh nhân có phân trang thất bại', err)
            next(err)
        }
    },
    getOverViewPatient: async (req, res, next) => {
        try {
            const data = await accountService.getOverViewPatient()
            const response = responseSuccess(data, 'Lấy tổng quan bệnh nhân có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan bệnh nhân có phân trang thất bại', err)
            next(err)
        }
    },
    getOverViewStaff: async (req, res, next) => {
        try {
            const data = await accountService.getOverViewStaff()
            const response = responseSuccess(data, 'Lấy tổng quan nhân sự có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan nhân sự có phân trang thất bại', err)
            next(err)
        }
    }

}