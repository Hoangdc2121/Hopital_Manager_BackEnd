import { responseSuccess } from "../../common/helpers/response.helper.js"
import { profileService } from "../../services/patient/profileService.js"

export const profileController = {
    getInfoPatient: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await profileService.getInfoPatient(patientId)
            const response = responseSuccess(data, 'Lấy thông tin bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin bệnh nhân thất bại', err)
            next(err)
        }
    },
    updateInfoPatient: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const avatarPath = req.file?.path;
            const data = await profileService.updateInfoPatient(patientId, req.body, avatarPath)
            const response = responseSuccess(data, 'Cập nhật thông tin bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông tin bệnh nhân thất bại', err)
            next(err)
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            const patientId = req.user.id
            await profileService.resetPassword(patientId, req.body)
            const response = responseSuccess(null, 'Cập nhật mật khẩu thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật mật khẩu thất bại', err)
            next(err)
        }
    },
}