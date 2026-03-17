import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/admin/dasboardService.js"

export const dashboardController = {
    getOverView: async (req, res, next) => {
        try {
            const data = await dashboardService.getOverView()
            const response = responseSuccess(data, 'Lấy tổng quan admin thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan admin thất bại', err)
            next(err)
        }
    },
    getRevenueAndAppointmentsChart: async (req, res, next) => {
        try {
            const from = req.query.from || new Date()
            const to = req.query.to || new Date()
            const data = await dashboardService.getRevenueAndAppointmentsChart(from, to)
            const response = responseSuccess(data, 'Lấy tổng doanh thua và tổng lượt tháng theo biểu đồ cột đôi admin thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng doanh thua và tổng lượt tháng theo biểu đồ cột đôi admin thất bại', err)
            next(err)
        }
    },
    getAppointmentByDepartment: async (req, res, next) => {
        try {
            const data = await dashboardService.getAppointmentByDepartment()
            const response = responseSuccess(data, 'Phân bố theo khoa thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Phân bố theo khoa thất bại', err)
            next(err)
        }
    },
    getTopDoctors: async (req, res, next) => {
        try {
            const data = await dashboardService.getTopDoctors()
            const response = responseSuccess(data, 'Lấy top bác sĩ có ca khám nhiều nhất thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy top bác sĩ có ca khám nhiều nhất thất bại', err)
            next(err)
        }
    },
    getDepartmentStats: async (req, res, next) => {
        try {
            const data = await dashboardService.getDepartmentStats()
            const response = responseSuccess(data, 'Thống kê theo khoa thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Thống kê theo khoa thất bại', err)
            next(err)
        }
    },
    getAllAppointments: async (req, res, next) => {
        try {
            const status = req.query.status || ""
            const page = req.query.page || 1
            const data = await dashboardService.getAllAppointments(status,page)
            const response = responseSuccess(data, '     thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch hẹn có phân trang thất bại', err)
            next(err)
        }
    }
}