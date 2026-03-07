import { responseSuccess } from "../../common/helpers/response.helper.js"
import { authService } from "../../services/auth/authService.js"

export const authController = {
    registerAdmin: async (req, res, next) => {
        try {
            const data = await authService.registerAdmin(req.body)
            const response = responseSuccess(data, 'Tạo tài khoản admin thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo tài khoản admin thất bại', err)
            next(err)
        }
    },
    registerPatient: async (req, res, next) => {
        try {
            const data = await authService.registerPatient(req.body)
            const response = responseSuccess(data, 'Tạo tài khoản bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo tài khoản bệnh nhân thất bại', err)
            next(err)
        }
    },
    login: async (req, res, next) => {
        try {
            const data = await authService.login(req.body)
            const response = responseSuccess(data, 'Đăng nhập tài khoản thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đăng nhập tài khoản thất bại', err)
            next(err)
        }
    },
}