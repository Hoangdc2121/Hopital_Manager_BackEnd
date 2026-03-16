import { responseSuccess } from "../../common/helpers/response.helper.js"
import { appointmentService } from "../../services/medicalStaff/appointmentService.js"

export const appointmentController = {
    getOverViewAppointment: async (req, res, next) => {
        try {
            const data = await appointmentService.getOverViewAppointment()
            const response = responseSuccess(data, 'Lấy tổng quan lịch hẹn của y tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan lịch hẹn của y tế thất bại', err)
            next(err)
        }
    },
    getAllAppointments: async (req, res, next) => {
        try {
            const departmentId = req.query.departmentId
            const doctorId = req.query.doctorId
            const page = req.query.page || 1
            const status = req.query.status
            const data = await appointmentService.getAllAppointments(departmentId, doctorId, status, page)
            const response = responseSuccess(data, 'Lấy danh sách lịch hẹn từ phía bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch hẹn từ phía bệnh nhân thất bại', err)
            next(err)
        }
    },
    getAllRequestAppointments: async (req, res, next) => {
        try {
            const page = req.query.page || 1
            const status = req.query.status
            const data = await appointmentService.getAllRequestAppointments(status, page)
            const response = responseSuccess(data, 'Lấy danh sách yêu cầu từ phía bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách yêu cầu từ phía bệnh nhân thất bại', err)
            next(err)
        }
    },
}