import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const doctorService = {
    getAllDoctorsSimple: async () => {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                isActive: true
            },
            select: {
                id: true,
                fullName: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return {
            doctors
        }
    },
    createDoctorSchedule: async (data) => {
        validateMissingFields(data, ['doctorId', 'dayOfWeek', 'startTime', 'endTime', 'slotDuration'])
        const { doctorId, dayOfWeek, startTime, endTime, slotDuration } = data

        if (!Number.isInteger(Number(doctorId))) {
            throw new BadrequestException('doctorId không hợp lệ')
        }
        if (!Number.isInteger(Number(dayOfWeek))) {
            throw new BadrequestException('Ngày trong tuần không hợp lệ')
        }
        if (!Number.isInteger(Number(startTime))) {
            throw new BadrequestException('Thời gian bắt đầu không hợp lệ')
        }
        if (!Number.isInteger(Number(endTime))) {
            throw new BadrequestException('Ngày trong tuần không hợp lệ')
        }
        if (!Number.isInteger(Number(slotDuration)) || Number(slotDuration) < 10) {
            throw new BadrequestException('ca khám không hợp lệ hoặc Ca khám phải tối thiểu là 10 phút')
        }
        if (Number(startTime) >= Number(endTime)) {
            throw new BadrequestException('Thời gian bắt đầu không được lớn hơn thời gian kết thúc')
        }

        const doctorSchedule = await prisma.doctorSchedule.create({
            data: {
                doctorId: Number(doctorId),
                dayOfWeek: Number(dayOfWeek),
                startTime: Number(startTime),
                endTime: Number(endTime),
                slotDuration: Number(slotDuration)
            }
        })
        return {
            doctorSchedule
        }
    },
    updateDoctorScheduleInfo: async (doctorScheduleId, data) => {
        const { dayOfWeek, startTime, endTime, slotDuration } = data
        const updateData = {}

        const doctorSchedule = await prisma.doctorSchedule.findUnique({
            where: {
                id: Number(doctorScheduleId)
            }
        })
        if (!doctorSchedule) {
            throw new NotFoundException("Không tìm thấy lịch bác sĩ")
        }

        if (dayOfWeek) updateData.dayOfWeek = Number(dayOfWeek)
        if (startTime) updateData.startTime = Number(startTime)
        if (endTime) updateData.endTime = Number(endTime)
        if (slotDuration) {
            if (!Number.isInteger(Number(slotDuration)) || Number(slotDuration) < 10) {
                throw new BadrequestException('ca khám không hợp lệ hoặc Ca khám phải tối thiểu là 10 phút')
            }
            updateData.slotDuration = Number(slotDuration)
        }
        const newStartTime = startTime ? Number(startTime) : doctorSchedule.startTime
        const newEndTime = endTime ? Number(endTime) : doctorSchedule.endTime
        if (newStartTime >= newEndTime) {
            throw new BadrequestException('Thời gian bắt đầu không được lớn hơn thời gian kết thúc')
        }
        const updateInfoDoctorSchedule = await prisma.doctorSchedule.update({
            where: {
                id: Number(doctorScheduleId)
            },
            data: updateData
        })
        return {
            updateInfoDoctorSchedule
        }
    },
    updateDoctorScheduleStatus: async (doctorScheduleId) => {
        const doctorSchedule = await prisma.doctorSchedule.findUnique({
            where: {
                id: Number(doctorScheduleId)
            }
        })
        if (!doctorSchedule) {
            throw new NotFoundException("Không tìm thấy lịch bác sĩ")
        }
        const updateDoctorScheduleStatus = await prisma.doctorSchedule.update({
            where: {
                id: Number(doctorScheduleId)
            },
            data: {
                isActive: !doctorSchedule.isActive
            }
        })
        return {
            updateDoctorScheduleStatus
        }
    },
    getAllDoctorSchedules: async (search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(search ? {
                doctor: {
                    fullName: {
                        contains: search
                    }
                }
            } : {})
        }
        const [doctorSchedules, totalDoctorSchedules] = await Promise.all([
            prisma.doctorSchedule.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: [
                    { doctorId: 'asc' },
                    { startTime: 'asc' }
                ],
                select: {
                    id: true,
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true,
                    slotDuration: true,
                    isActive: true,
                    doctor: {
                        select: {
                            id: true,
                            fullName: true,
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
            prisma.doctorSchedule.count({
                where: whereCondition
            })
        ])
        return {
            doctorSchedules,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalDoctorSchedules,
                totalPages: Math.ceil(totalDoctorSchedules / limit)
            }
        }
    }
}