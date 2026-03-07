export const dashboardService = {
  getOverView: async () => {

  },
  getRevenueAndAppointmentsChart: async () => {

    const payments = await prisma.payment.findMany({
      where: {
        status: "SUCCESS"
      },
      select: {
        amount: true,
        paidAt: true
      }
    })

    const appointments = await prisma.appointment.findMany({
      select: {
        appointmentDate: true
      }
    })

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      appointments: 0
    }))

    // ===== tính doanh thu =====
    payments.forEach(p => {
      if (p.paidAt) {
        const m = new Date(p.paidAt).getMonth()
        months[m].revenue += p.amount
      }
    })

    // ===== tính lượt khám =====
    appointments.forEach(a => {
      const m = new Date(a.appointmentDate).getMonth()
      months[m].appointments += 1
    })

    return months
  },
  getAppointmentByDepartment : async () => {

    const stats = await prisma.appointment.groupBy({
      by: ['departmentId'],
      _count: { id: true }
    })

    const departments = await prisma.department.findMany({
      select: { id: true, name: true }
    })

    const total = stats.reduce((sum, i) => sum + i._count.id, 0)

    const data = stats.map(i => {
      const department = departments.find(d => d.id === i.departmentId)

      return {
        name: department?.name,
        value: i._count.id,
        percent: Number(((i._count.id / total) * 100).toFixed(2))
      }
    })

    return {
      totalAppointments: total,
      data
    }
  }
}