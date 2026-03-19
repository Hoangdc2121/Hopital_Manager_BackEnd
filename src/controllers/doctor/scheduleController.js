import { responseSuccess } from "../../common/helpers/response.helper.js"
import { scheduleService } from "../../services/doctor/scheduleService.js"

export const scheduleController = {
    getDoctorSchedule : async (req,res,next) => {
        try {
            const doctorId = req.user.id
            const data = await scheduleService.getDoctorSchedule(doctorId)
            const response = responseSuccess(data,'Lấy ca làm của bác sĩ này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy ca làm của bác sĩ này thất bại',err)
            next(err)
        }
    }
}