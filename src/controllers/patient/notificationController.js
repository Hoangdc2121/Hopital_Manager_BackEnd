import { responseSuccess } from "../../common/helpers/response.helper.js"
import { notificationService } from "../../services/patient/notificationService.js"

export const notificationController = {
    getAllNofications: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await notificationService.getAllNofications(patientId)
            const response = responseSuccess(data, 'Lấy tất cả thông báo của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tất cả thông báo của bệnh nhân thất bại', err)
            next(err)
        }
    },
    getInfoNotification: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const notificationId = req.params.notificationId
            const data = await notificationService.getInfoNotification(patientId, notificationId)
            const response = responseSuccess(data, 'Lấy thông tin thông báo của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin thông báo của bệnh nhân thất bại', err)
            next(err)
        }
    },
}