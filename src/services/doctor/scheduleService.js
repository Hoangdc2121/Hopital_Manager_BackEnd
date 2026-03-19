import prisma from "../../common/prisma/initPrisma.js"

export const scheduleService = {
    getDoctorSchedule: async (doctorId) => {
        const schedules = await prisma.doctorSchedule.findMany({
            where : {
                doctorId : doctorId,
                isActive : true
            },
            select : {
                id : true,
                dayOfWeek : true,
                startTime : true,
                endTime : true,
                slotDuration : true,
            }
        })
        return {
            schedules
        }
    },
}