import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService = {
    getAppointmentComming: async (doctorId) => {
        // const now = new Date()
        const appointment = await prisma.appointment.findFirst({
            where: {
                status: 'WAITING',
                doctorId: doctorId,
            },
            orderBy: {
                appointmentDate: 'asc'
            },
            select: {
                id: true,
                appointmentDate: true,
                status: true,
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true
                    }
                }
            }
        })
        return {
            appointment
        }
    },
    getHistoryAppointment: async (doctorId) => {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                status: 'CONFIRMED'
            },
            orderBy: {
                appointmentDate: 'asc'
            },
            select: {
                id: true,
                appointmentDate: true,
                status: true,
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true
                    }
                }
            }
        })
        return {
            appointments
        }
    }
}