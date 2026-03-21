import { responseSuccess } from "../../common/helpers/response.helper.js"
import { medicineService } from "../../services/doctor/medicineService.js"

export const medicineController = {
    getAllMedicine: async (req,res,next) => {
        try {
            const search = req.query.search 
            const data = await medicineService.getAllMedicine(search)
            const response = responseSuccess(data,'Lấy danh sách thuốc thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách thuốc thất bại',err)
            next(err)
        }
    }
}