import { responseSuccess } from "../../common/helpers/response.helper.js"
import { doctorService } from "../../services/admin/doctorService.js"

export const doctorController = {
    getAllDoctorsSimple: async (req, res, next) => {
        try {
            const data = await doctorService.getAllDoctorsSimple()
            const response = responseSuccess(data, 'Lấy danh sách bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách bác sĩ thất bại', err)
            next(err)
        }
    },
    createDoctorSchedule: async (req, res, next) => {
        try {
            const data = await doctorService.createDoctorSchedule(req.body)
            const response = responseSuccess(data, 'Tạo lịch làm việc cho bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo lịch làm việc cho bác sĩ thất bại', err)
            next(err)
        }
    },
    updateDoctorScheduleInfo: async (req, res, next) => {
        try {
            const doctorScheduleId = req.params.doctorScheduleId
            const data = await doctorService.updateDoctorScheduleInfo(doctorScheduleId, req.body)
            const response = responseSuccess(data, 'Cập nhật lịch làm việc cho bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật lịch làm việc cho bác sĩ thất bại', err)
            next(err)
        }
    },
    updateDoctorScheduleStatus: async (req, res, next) => {
        try {
            const doctorScheduleId = req.params.doctorScheduleId
            const data = await doctorService.updateDoctorScheduleStatus(doctorScheduleId)
            const response = responseSuccess(data, 'Cập nhật trạng thái lịch làm việc cho bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái lịch làm việc cho bác sĩ thất bại', err)
            next(err)
        }
    },
    removeDoctorSchedule: async (req, res, next) => {
        try {
            const doctorScheduleId = req.params.doctorScheduleId
            await doctorService.removeDoctorSchedule(doctorScheduleId)
            const response = responseSuccess(null, 'Xóa lịch làm việc cho bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xóa lịch làm việc cho bác sĩ thất bại', err)
            next(err)
        }
    },
    getAllDoctorSchedules: async (req, res, next) => {
        try {
            const search = req.query.search
            const page = req.query.page || 1
            const data = await doctorService.getAllDoctorSchedules(search, page)
            const response = responseSuccess(data, 'Lấy danh sách lịch làm của bác sĩ có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch làm của bác sĩ có phân trang thất bại', err)
            next(err)
        }
    }
}