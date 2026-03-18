import { responseSuccess } from "../../common/helpers/response.helper.js"
import {medicalRecordService } from "../../services/patient/medicalRecordService.js"

export const medicalRecordController = {
    getAllAppointmentsSucces: async (req,res,next) => {
        try {
            const data = await medicalRecordService.getAllAppointmentsSucces()
            const response = responseSuccess(data,'Lấy danh sách lịch khám của người này đã khám thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch khám của người này đã khám thất bại',err)
            next(err)
        }
    },
     getMedicalRecordByAppointment: async (req,res,next) => {
        try {
            const appointmentId = req.params.appointmentId
            const data = await medicalRecordService.getMedicalRecordByAppointment(appointmentId)
            const response = responseSuccess(data,'Lấy chi tiết hồ sơ khám bệnh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy chi tiết hồ sơ khám bệnh thất bại',err)
            next(err)
        }
    },
}