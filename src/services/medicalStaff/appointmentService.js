import { NotFoundException } from "../../common/helpers/exception.helper"
import prisma from "../../common/prisma/initPrisma"

export const appointmentService = {
    getOverView: async () => {
        const startDay = new Date()
        startDay.setHours(0, 0, 0, 0)
        const endDay = new Date()
        endDay.setHours(23, 59, 59, 999);
        const [totalAppointments, totalAppointmentsPending, totalAppointmentsToday, totalAppointmentsSucces] = await Promise.all([
            prisma.appointment.count(),
            prisma.appointment.count({
                where: {
                    status: 'PENDING'
                }
            }),
            prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: startDay, lte: endDay
                    }
                }
            }),
            prisma.appointment.count({
                where: {
                    status: 'COMPLETED'
                }
            })
        ])
        return {
            totalAppointments,
            totalAppointmentsPending,
            totalAppointmentsToday,
            totalAppointmentsSucces
        }
    },
    getAllAppointments: async (departmentId, doctorId, status, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const whereCondition = {
            status: {
                not: ['WAITING', 'IN_PROGRESS']
            },
            ...(departmentId ? {
                departmentId: Number(departmentId)
            } : {}),
            ...(doctorId ? {
                doctorId: Number(doctorId)
            } : {}),
            ...(status ? {
                status: status
            } : {}),
        }
        const [appointments, totalAppointments] = await Promise.all([
            prisma.appointment.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    appointmentDate: true,
                    slotStart: true,
                    slotEnd: true,
                    reason: true,
                    status: true,
                    patient: {
                        select: {
                            id: true,
                            fullName: true,
                            phoneNumber: true,
                            role: true
                        }
                    },
                    doctor: {
                        select: {
                            id: true,
                            fullName: true,
                            role: true,
                            department: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
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
    },
    approveAppointment: async (appointmentId) => {
        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch khám này')
        }
        // const
    }

}