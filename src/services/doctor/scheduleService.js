import prisma from "../../common/prisma/initPrisma.js"

export const scheduleService = {
    getDoctorSchedule: async (doctorId) => {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const schedules = await prisma.doctorSchedule.findMany({
            where: {
                doctorId: doctorId,
                isActive: true,
                dayOfWeek : dayOfWeek
            },
            select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                slotDuration: true,
            }
        })
        return {
            schedules
        }
    },
}