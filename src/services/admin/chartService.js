import { ChartJSNodeCanvas } from "chartjs-node-canvas"

const width = 800
const height = 600
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })

export const chartService = {


  revenueAppointmentBar: async (months) => {
    const labels = months.map(m => `Tháng ${m.month}`)
    const revenueData = months.map(m => m.revenue)
    const appointmentData = months.map(m => m.appointments)

    const config = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Doanh thu (VND)",
            data: revenueData,
            backgroundColor: "#0EA5E9",
            yAxisID: "yRevenue"
          },
          {
            label: "Lượt khám",
            data: appointmentData,
            backgroundColor: "#F97316",
            yAxisID: "yAppointment"
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
            ticks: {
              beginAtZero: true,
              stepSize: 50000 // tùy chỉnh
            }
          },
          yAppointment: {
            type: "linear",
            position: "right",
            title: { display: true, text: "Lượt khám" },
            ticks: {
              beginAtZero: true,
              stepSize: 1
            },
            grid: { drawOnChartArea: false },
            suggestedMax: 5 // giới hạn tối đa lượt khám cho biểu đồ nhìn cân đối
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