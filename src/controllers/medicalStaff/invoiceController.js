
import { responseSuccess } from "../../common/helpers/response.helper.js"
import { invoiceService } from "../../services/medicalStaff/invoiceService.js"

export const invoiceController = {
    getAllInvoices: async (req, res, next) => {
        try {
            const status = req.query.status
            const search = req.query.search
            const page = req.query.page || 1
            const data = await invoiceService.getAllInvoices(search, status, page)
            const response = responseSuccess(data, 'Lấy danh sách hóa đơn thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách hóa đơn thất bại', err)
            next(err)
        }
    },
    ConfirmPaymentInvoice: async (req, res, next) => {
        try {
            const invoiceId = req.params.invoiceId
            const medicalId = req.user.id
            const data = await invoiceService.ConfirmPaymentInvoice(invoiceId, medicalId)
            const response = responseSuccess(data, 'Xác nhận thanh toán thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xác nhận thanh toán thất bại', err)
            next(err)
        }
    }
}