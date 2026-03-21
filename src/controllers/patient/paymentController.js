import { responseSuccess } from "../../common/helpers/response.helper.js"
import { paymentService } from "../../services/patient/paymentService.js"

export const paymentController = {
    getHistoryPayments: async (req,res,next) => {
        try {
            const patientId = req.user.id 
            const data = await paymentService.getHistoryPayments(patientId)
            const response = responseSuccess(data,'Lấy lịch sử thanh toán thành công')
             res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy lịch sử thanh toán thất bại',err)
            next(err)
        }
    }
}