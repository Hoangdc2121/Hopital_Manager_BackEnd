import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/doctor/dashboardService.js"

export const dashboardController = {
    getAppointmentComming: async (req,res,next) => {
        try {
            const doctorId = req.user.id
            const data = await dashboardService.getAppointmentComming(doctorId)
            const response = responseSuccess(data,'Lấy lịch hẹn chuẩn bị tới của bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy lịch hẹn chuẩn bị tới của bác sĩ thất bại',err)
            next(err)
        }
    },
     getHistoryAppointment: async (req,res,next) => {
        try {
            const doctorId = req.user.id
            const page = req.query.page || 1
            const data = await dashboardService.getHistoryAppointment(doctorId,page)
            const response = responseSuccess(data,'Lấy lịch sử khám bệnh nhân đã hoàn thành thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy lịch sử khám bệnh nhân đã hoàn thành thất bại',err)
            next(err)
        }
    },
}