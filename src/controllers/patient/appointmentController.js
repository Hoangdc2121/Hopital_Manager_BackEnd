import { responseSuccess } from "../../common/helpers/response.helper.js"
import { appointmentService } from "../../services/patient/appointmentService.js"

export const appointmentController = {
    getAllDepartmentsSimple: async (req, res, next) => {
        try {
            const data = await appointmentService.getAllDepartmentsSimple();
            const response = responseSuccess(data, "Lấy danh sách khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khoa thất bại", err)
            next(err)
        }
    },
    getAllDoctorsByDepartment: async (req, res, next) => {
        try {
            const departmentId = req.params.departmentId
            const data = await appointmentService.getAllDoctorsByDepartment(departmentId);
            const response = responseSuccess(data, "Lấy danh sách bác sĩ theo khoa thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách bác sĩ theo khoa khoa thất bại", err)
            next(err)
        }
    },
    getAvailableSlots: async (req, res, next) => {
        try {
            const doctorId = req.params.doctorId
            const date = req.query.date || new Date()
            const data = await appointmentService.getAvailableSlots(doctorId, date)
            const response = responseSuccess(data, 'Lấy danh sách ca khám của bs đó còn trống thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách ca khám của bs đó còn trống thất bại', err)
            next(err)
        }
    },
    registerAppointment: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await appointmentService.registerAppointment(patientId, req.body)
            const response = responseSuccess(data, 'Đăng kí lịch khám thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đăng kí lịch khám thất bại', err)
            next(err)
        }
    },
    getAllAppointments: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await appointmentService.getAllAppointments(patientId)
            const response = responseSuccess(data, 'Lấy danh sách ca khám của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách ca khám của bệnh nhân thất bại', err)
            next(err)
        }
    },
    requestCancelAppointment: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const appointmentId = req.params.appointmentId
            const data = await appointmentService.requestCancelAppointment(patientId, appointmentId, req.body)
            const response = responseSuccess(data, 'Yêu cầu dừng ca khám của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Yêu cầu dừng ca khám của bệnh nhân thất bại', err)
            next(err)
        }
    },
    requestAppointment: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const appointmentId = req.params.appointmentId
            const data = await appointmentService.requestAppointment(patientId, appointmentId, req.body)
            const response = responseSuccess(data, 'Yêu cầu đổi lịch hoặc đổi bác sĩ ca khám của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Yêu cầu đổi lịch hoặc đổi bác sĩ ca khám của bệnh nhân thất bại', err)
            next(err)
        }
    },
     getHistoryRequestAppointment: async (req, res, next) => {
        try {
            const patientId = req.user.id
            const data = await appointmentService.getHistoryRequestAppointment(patientId)
            const response = responseSuccess(data, 'Lấy danh sách lịch sử yêu cầu của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch sử yêu cầu của bệnh nhân thất bại', err)
            next(err)
        }
    },
    
}