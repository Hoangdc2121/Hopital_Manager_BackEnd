
import { reportService } from "../../services/admin/reportService.js"


export const reportController = {
  exportReportPdf: async (req, res, next) => {
    try {
      const year = req.query.year || new Date().getFullYear()
      await reportService.exportHospitalReport(year, res)
    } catch (err) {
      console.error("Lấy báo cáo thất bại", err)
      if (!res.headersSent) next(err)
    }
  }
}