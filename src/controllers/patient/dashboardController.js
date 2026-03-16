import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/patient/dashboardService.js"

export const dahsboardController = {
    getOverView: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await dashboardService.getOverView(patientId)
            const response = responseSuccess(data, 'Lấy tổng quan bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan bệnh nhân thất bại', err)
            next(err)
        }
    },
    getAllAppointments: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await dashboardService.getAllAppointments(patientId)
            const response = responseSuccess(data, 'Lấy danh sách ca khám của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách ca khám của bệnh nhân thất bại', err)
            next(err)
        }
    },
    getHistoryAppointments: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await dashboardService.getHistoryAppointments(patientId)
            const response = responseSuccess(data, 'Lấy danh sách lịch sử ca khám của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch sử ca khám của bệnh nhân thất bại', err)
            next(err)
        }
    },
}