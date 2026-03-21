// src/services/admin/reportService.js
import PdfPrinter from "pdfmake/src/printer.js"
import path from "path"
import { dashboardService } from "../admin/dasboardService.js"
import { chartService } from "../admin/chartService.js"

// ===== Fonts PDF =====
const fonts = {
  Roboto: {
    normal: path.resolve("src/common/font/Roboto-Regular.ttf"),
    bold: path.resolve("src/common/font/Roboto-Bold.ttf"),
  }
}

const printer = new PdfPrinter(fonts)

// ===== Utils =====
const formatNumber = (n) => new Intl.NumberFormat("vi-VN").format(n)
const toBase64Image = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`

// ===== Sections & Tables =====
const createSection = (title) => ([
  { text: title, style: "sectionTitle" },
  {
    canvas: [
      { type: "rect", x: 0, y: 0, w: 515, h: 1, color: "#0EA5E9" }
    ],
    margin: [0, 6, 0, 12]
  }
])

const createTable = (headers, rows) => ({
  table: {
    headerRows: 1,
    widths: Array(headers.length).fill("*"),
    body: [
      headers.map(h => ({ text: h, style: "tableHeader" })),
      ...rows.map((row, i) =>
        row.map(cell => ({
          text: String(cell),
          fillColor: i % 2 === 0 ? "#E0F2FE" : null
        }))
      )
    ]
  },
  layout: {
    hLineColor: () => "#BAE6FD",
    vLineColor: () => "#BAE6FD"
  },
  margin: [0, 6, 0, 20]
})

// ===== Main Service =====
export const reportService = {
  async exportHospitalReport(year, res) {

    // ==== LẤY DỮ LIỆU =====
    const overview = await dashboardService.getOverViewFull()
    const chartData = await dashboardService.getRevenueAndAppointmentsChart()
    const departmentStats = await dashboardService.getAppointmentByDepartment()

    // ==== TẠO BIỂU ĐỒ =====
    const revenueChart = await chartService.revenueAppointmentBar(chartData)
    const departmentChart = await chartService.appointmentDepartmentPie(departmentStats.data)

    // ==== BẢNG DỮ LIỆU DOANH THU & LƯỢT KHÁM =====
    const revenueTableHeaders = ["Tháng", "Doanh thu (VND)", "Lượt khám"]
    const revenueTableRows = chartData.map(m => [
      `Tháng ${m.month}`,
      formatNumber(m.revenue),
      m.appointments
    ])

    // ==== PDF DOCUMENT =====
    const doc = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: "Roboto" },

      content: [

        // ===== Header =====
        {
          stack: [
            { text: "BÁO CÁO THỐNG KÊ BỆNH VIỆN", style: "header" },
            {
              columns: [
                { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: "meta" },
                { text: `Năm: ${year}`, alignment: "right", style: "meta" }
              ]
            }
          ],
          margin: [0, 0, 0, 25]
        },

        // ===== I. Tổng quan hệ thống =====
        ...createSection("I. Tổng quan hệ thống"),
        createTable(
          ["Chỉ số", "Giá trị"],
          [
            ["Tổng doanh thu", formatNumber(overview.totalRevenue._sum.totalAmount || 0) + " VND"],
            ["Tổng bệnh nhân", overview.totalPatients],
            ["Tổng bác sĩ", overview.totalDoctors],
            ["Tổng nhân viên y tế", overview.totalMedicalStaffs],
            ["Tổng khoa", overview.totalDepartments],
            ["Tổng thuốc", overview.totalMediciens],
            ["Tổng lịch khám", overview.totalAppointments],
          ]
        ),

        // ===== II. Doanh thu & lượt khám theo tháng =====
        ...createSection("II. Doanh thu & lượt khám theo tháng"),
        {
          image: toBase64Image(revenueChart),
          width: 520,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(revenueTableHeaders, revenueTableRows),

        // ===== III. Cơ cấu lượt khám theo khoa =====
        ...createSection("III. Cơ cấu lượt khám theo khoa"),
        {
          image: toBase64Image(departmentChart),
          width: 300,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(
          ["Khoa", "Lượt khám", "Tỷ lệ (%)"],
          departmentStats.data.map(d => [
            d.name,
            d.value,
            d.percent
          ])
        )

      ],

      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: "center",
          color: "#0369A1"
        },
        meta: {
          fontSize: 10,
          color: "#475569"
        },
        sectionTitle: {
          fontSize: 15,
          bold: true,
          color: "#0284C7"
        },
        tableHeader: {
          bold: true,
          fillColor: "#0EA5E9",
          color: "white",
          alignment: "center"
        }
      }
    }

    // ==== GHI PDF RA RESPONSE =====
    const pdfDoc = printer.createPdfKitDocument(doc)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=bao-cao-benh-vien.pdf")

    pdfDoc.pipe(res)
    pdfDoc.end()
  }
}