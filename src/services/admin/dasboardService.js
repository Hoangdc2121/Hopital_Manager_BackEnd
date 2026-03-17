import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService = {
  getOverView: async () => {
    const [
      revenueAgg,
      totalAppointments,
      totalPatients,
      cancelledAppointments
    ] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { totalAmount: true }
      }),

      prisma.appointment.count(),

      prisma.user.count({
        where: { role: 'PATIENT' }
      }),

      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      })
    ])

    const totalRevenue = revenueAgg._sum.totalAmount ?? 0

    const cancelRate = totalAppointments === 0
      ? 0
      : Number(((cancelledAppointments / totalAppointments) * 100).toFixed(2))

    return {
      totalRevenue,
      totalAppointments,
      totalPatients,
      cancelRate
    }
  },
  getRevenueAndAppointmentsChart: async (from, to) => {

    const dateFilter = from && to ? {
      gte: new Date(from),
      lte: new Date(to)
    } : undefined

    const payments = await prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        ...(dateFilter ? { paidAt: dateFilter } : {})
      },
      select: {
        amount: true,
        paidAt: true
      }
    })

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(dateFilter ? { appointmentDate: dateFilter } : {})
      },
      select: {
        appointmentDate: true
      }
    })

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      appointments: 0
    }))

    payments.forEach(p => {
      if (p.paidAt) {
        const m = new Date(p.paidAt).getMonth()
        months[m].revenue += p.amount
      }
    })


    appointments.forEach(a => {
      const m = new Date(a.appointmentDate).getMonth()
      months[m].appointments += 1
    })


    return months.filter(m => m.revenue > 0 || m.appointments > 0)
  },
  getAppointmentByDepartment: async () => {

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
  },
  getTopDoctors: async () => {
    const limit = 5
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorAppointments: {
          some: {}
        }
      },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        _count: {
          select: {
            doctorAppointments: true
          }
        }
      },
      orderBy: {
        doctorAppointments: {
          _count: 'desc'
        }
      },
      take: limit
    })
    return {
      doctors
    }
  },
  getDepartmentStats: async () => {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true
      }
    })


    const result = await Promise.all(
      departments.map(async (dept) => {


        const totalAppointments = await prisma.appointment.count({
          where: {
            departmentId: dept.id
          }
        })


        const revenue = await prisma.invoice.aggregate({
          _sum: {
            totalAmount: true
          },
          where: {
            appointment: {
              departmentId: dept.id
            }
          }
        })

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          totalAppointments,
          totalRevenue: revenue._sum.totalAmount || 0
        }
      })
    )

    return result
  },
  getAllAppointments: async (status, page) => {
    const limit = 5
    const skip = (Number(page) - 1) * limit
    const whereCondition = {
      ...(status ? {
        status: status
      } : {})
    }
    const [appointments, totalAppointments] = await Promise.all([
      prisma.appointment.findMany({
        where: whereCondition,
        take: limit,
        skip: skip,
        select: {
          code: true,
          appointmentDate: true,
          reason: true,
          status: true,
          patient: {
            select: {
              fullName: true
            }
          },
          doctor: {
            select: {
              fullName: true
            }
          },
          department: {
            select: {
              name: true
            }
          },
          invoice: {
            select: {
              totalAmount: true
            }
          }
        }
      }),
      prisma.appointment.count({
        where: whereCondition
      })
    ])
    return {
      appointments,
      pagination: {
        page: Number(page),
        limit: limit,
        total: totalAppointments,
        totalPages: Math.ceil(totalAppointments / limit)
      }
    }
  }
}