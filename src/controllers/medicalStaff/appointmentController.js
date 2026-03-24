import { responseSuccess } from "../../common/helpers/response.helper.js"
import { appointmentService } from "../../services/medicalStaff/appointmentService.js"

export const appointmentController = {
    getAllDoctors: async (req,res,next) => {
        try {
            const data = await appointmentService.getAllDoctors()
            const response = responseSuccess(data,'Lấy danh sách bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách bác sĩ thành công', err)
            next(err)
        }
    },
    getAllDoctorsByDepartment: async (req, res, next) => {
        try {
            const departmentId = req.params.departmentId
            const data = await appointmentService.getAllDoctorsByDepartment(departmentId)
            const response = responseSuccess(data, 'Lấy danh sách bác sĩ theo khoa thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách bác sĩ theo khoa thất bại", err)
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
    getOverView: async (req, res, next) => {
        try {
            const data = await appointmentService.getOverView()
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
    confirmAppointment: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            await appointmentService.confirmAppointment(appointmentId)
            const response = responseSuccess(null, 'Xác nhận lịch khám thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xác nhận lịch khám thất bại', err)
            next(err)
        }
    },
    cancelAppointment: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            await appointmentService.cancelAppointment(appointmentId, req.body)
            const response = responseSuccess(null, 'Hủy lịch khám thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Hủy lịch khám thất bại', err)
            next(err)
        }
    },
    changeAppointment: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            await appointmentService.changeAppointment(appointmentId, req.body)
            const response = responseSuccess(null, 'Cập nhật lịch khám thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật lịch khám thất bại', err)
            next(err)
        }
    },
    approveRequest: async (req, res, next) => {
        try {
            const requestId = req.params.requestId
            const medicalId = req.user.id
            await appointmentService.approveRequest(requestId, medicalId)
            const response = responseSuccess(null, 'Chấp nhận yêu cầu thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Chấp nhận yêu cầu thất bại', err)
            next(err)
        }
    },
    rejectRequest: async (req, res, next) => {
        try {
            const requestId = req.params.requestId
            const medicalId = req.user.id
            await appointmentService.rejectRequest(requestId, medicalId)
            const response = responseSuccess(null, 'Từ chối yêu cầu thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Từ chối yêu cầu thất bại', err)
            next(err)
        }
    },
    getAllAppointmentConfirm: async (req, res, next) => {
        try {
            const page = req.query.page || 1
            const data = await appointmentService.getAllAppointmentConfirm(page)
            const response = responseSuccess(data, 'Lấy danh sách bệnh nhân đã được xác nhận lịch thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách bệnh nhân đã được xác nhận lịch thất bại', err)
            next(err)
        }
    },
    receptionAppointment: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            const data = await appointmentService.receptionAppointment(appointmentId)
            const response = responseSuccess(data, 'Chấp nhận tiếp nhận bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Chấp nhận tiếp nhận bệnh nhân thất bại', err)
            next(err)
        }
    },
    notComeAppointment: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            const data = await appointmentService.notComeAppointment(appointmentId)
            const response = responseSuccess(data, 'Xác nhận bệnh nhân không đến thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('CXác nhận bệnh nhân không đến thất bại', err)
            next(err)
        }
    },
    getAllAppointmentReception: async (req, res, next) => {
        try {
            const page = req.query.page || 1
            const data = await appointmentService.getAllAppointmentReception(page)
            const response = responseSuccess(data, 'Lấy danh sách bệnh nhân đã được tiếp nhận lịch thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách bệnh nhân đã được tiếp nhận lịch thất bại', err)
            next(err)
        }
    },
    createVitalSign: async (req, res, next) => {
        try {
            const medicalId = req.user.id
            const appointmentId = req.params.appointmentId
            const data = await appointmentService.createVitalSign(medicalId,appointmentId, req.body)
            const response = responseSuccess(data, 'Tạo phiếu khám bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo phiếu khám bệnh nhân thất bại', err)
            next(err)
        }
    }
}