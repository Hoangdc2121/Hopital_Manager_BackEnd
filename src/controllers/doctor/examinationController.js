import { responseSuccess } from "../../common/helpers/response.helper.js"
import { examinationService } from "../../services/doctor/examinationService.js"

export const examinationController = {
    getOverviewExamination: async (req, res, next) => {
        try {
            const doctorId = req.user.id
            const data = await examinationService.getOverviewExamination(doctorId)
            const response = responseSuccess(data, 'Lấy tổng quan thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan thất bại', err)
            next(err)
        }
    },
    getAllExaminationDoctor: async (req, res, next) => {
        try {
            const doctorId = req.user.id
            const scheduleId = req.params.scheduleId
            const page = req.query.page || 1
            const data = await examinationService.getAllExaminationDoctor(doctorId, scheduleId, page)
            const response = responseSuccess(data, 'Lấy danh sách ca khám của bác sĩ thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách ca khám của bác sĩ thất bại', err)
            next(err)
        }
    },
    examinationPatient: async (req, res, next) => {
        try {
            const doctorId = req.user.id
            const appointmentId = req.params.appointmentId
            const data = await examinationService.examinationPatient(doctorId, appointmentId)
            const response = responseSuccess(data, 'Chấp nhận khám cho bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Chấp nhận khám cho bệnh nhân thất bại', err)
            next(err)
        }
    },
    getInfoVitalSign: async (req, res, next) => {
        try {
            const appointmentId = req.params.appointmentId
            const data = await examinationService.getInfoVitalSign(appointmentId)
            const response = responseSuccess(data, 'Lấy thông tin phiếu khám bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin phiếu khám bệnh thất bại', err)
            next(err)
        }
    },
    createMedicalRecord: async (req, res, next) => {
        try {
            const doctorId = req.user.id
            const appointmentId = req.params.appointmentId
            const data = await examinationService.createMedicalRecord(doctorId, appointmentId, req.body)
            const response = responseSuccess(data, 'Tạo hồ sơ bệnh án của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo hồ sơ bệnh án của bệnh nhân thất bại', err)
            next(err)
        }
    },
    createPrescriptionAndInvoice: async (req, res, next) => {
        try {
            const medicalRecordId = req.params.medicalRecordId
            const data = await examinationService.createPrescriptionAndInvoice(medicalRecordId,req.body)
            const response = responseSuccess(data, 'Kê toa thuốc của bệnh nhân thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Kê toa thuốc của bệnh nhân thất bại', err)
            next(err)
        }
    },
}