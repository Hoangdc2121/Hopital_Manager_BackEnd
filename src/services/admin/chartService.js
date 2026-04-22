import { ChartJSNodeCanvas } from "chartjs-node-canvas"

const width = 800
const height = 600
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })

export const chartService = {
  revenueAppointmentLine: async (months) => {
    const labels = months.map(m => `Tháng ${m.month}`)
    const revenueData = months.map(m => m.revenue)
    const appointmentData = months.map(m => m.appointments)

    const config = {
      type: "line", // 🔥 đổi bar -> line
      data: {
        labels,
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: revenueData,
            borderColor: "#0EA5E9",
            backgroundColor: "rgba(14,165,233,0.2)",
            yAxisID: "yRevenue",
            tension: 0.4,
            fill: true,
            pointRadius: 4
          },
          {
            label: "Lượt khám",
            data: appointmentData,
            borderColor: "#F97316",
            backgroundColor: "rgba(249,115,22,0.2)",
            yAxisID: "yAppointment",
            tension: 0.4,
            fill: true,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          yRevenue: {
            type: "linear",
            position: "left",
            title: { display: true, text: "Doanh thu (VND)" },
            beginAtZero: true
          },
          yAppointment: {
            type: "linear",
            position: "right",
            title: { display: true, text: "Lượt khám" },
            beginAtZero: true,
            grid: { drawOnChartArea: false }
          }
        }
      }
    }

    return await chartJSNodeCanvas.renderToBuffer(config)
  },


  appointmentDepartmentPie: async (data) => {
    const config = {
      type: "pie",
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value)
        }]
      }
    }

    return await chartJSNodeCanvas.renderToBuffer(config)
  }
}