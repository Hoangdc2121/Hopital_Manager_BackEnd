import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const appointmentService = {
    getOverViewAppointment: async () => {
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
                in: ['PENDING', 'COMPLETED', 'CANCELLED']
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
    getAllRequestAppointments: async (status, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit

        const whereCondition = {
            ...(status ? {
                status: status
            } : {})
        }
        const [requests, totalRequests] = await Promise.all([
            prisma.appointmentRequest.findMany({
                where: whereCondition,
                include: {
                    appointment: true,
                    oldDoctor: true,
                    newDoctor: true,
                    patient: true
                }
            }),
            prisma.appointmentRequest.count({
                where: whereCondition
            })
        ])
        return {
            requests,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalRequests,
                totalPages: Math.ceil(totalRequests / limit)
            }
        }
    },
    confirmAppointment: async (appointmentId) => {
        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm lấy lịch này')
        }
        await prisma.appointment.update({
            where: {
                status: 'CONFIRMED'
            }
        })
    },
    cancelAppointment: async (appointmentId, data) => {
        const { reason } = data

        const appointment = await prisma.appointment.findUnique({
            where: { id: Number(appointmentId) },
            include: {
                patient: true,
                doctor: true,
                department: true
            }
        })

        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch khám')
        }

    
        await prisma.appointment.update({
            where: { id: Number(appointmentId) },
            data: {
                status: 'CANCELLED',
                reason: reason ? reason.trim() : null
            }
        })

        const date = new Date(appointment.appointmentDate)
        const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        const dateStr = date.toLocaleDateString('vi-VN')

   
        await prisma.notification.create({
            data: {
                userId: appointment.patient.id,
                title: "Lịch khám đã bị hủy",
                message: `Lịch khám lúc ${timeStr} ngày ${dateStr} với bác sĩ ${appointment.doctor.fullName} (${appointment.department.name}) đã bị hủy.${reason ? ` Lý do: ${reason}` : ''}`
            }
        })
    }

}