import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateAppointCode from "../../common/helpers/generateAppointmentCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const appointmentService = {
    getAllDepartmentsSimple: async () => {
        const departments = await prisma.department.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                code: true,
                name: true
            }
        })
        return {
            departments
        }
    },
    getAllDoctorsByDepartment: async (departmentId) => {
        const department = await prisma.department.findUnique({
            where: {
                id: Number(departmentId)
            }
        })
        if (!department) {
            throw new NotFoundException('Không tìm thấy khoa này')
        }
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                departmentId: Number(departmentId)
            },
            include: {
                department: true
            }
        })
        return {
            doctors
        }
    },
    getAvailableSlots: async (doctorId, date) => {
        const targetDate = new Date(date)

        const dayOfWeek = targetDate.getDay()

        const schedule = await prisma.doctorSchedule.findMany({
            where: {
                doctorId: Number(doctorId),
                dayOfWeek: dayOfWeek
            }
        })

        if (!schedule.length) {
            return { slots: [] }
        }

        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: Number(doctorId),
                appointmentDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS']
                }
            },
            select: {
                appointmentDate: true
            }
        })

        const bookedSlots = appointments.map(a => {
            return new Date(a.appointmentDate).getTime()
        })

        const slots = []

        const now = new Date()
        const isToday = targetDate.toDateString() === now.toDateString()

        for (const s of schedule) {
            let current = s.startTime

            while (current + s.slotDuration <= s.endTime) {
                const hour = Math.floor(current / 60)
                const minute = current % 60

                const slotDate = new Date(targetDate)
                slotDate.setHours(hour, minute, 0, 0)

                const slotTime = slotDate.getTime()
                const isBooked = bookedSlots.includes(slotTime)
                const isPast = slotTime < now.getTime()

                if (!isBooked) {
                    if (isToday && isPast) {

                    } else {
                        slots.push(slotDate)
                    }
                }

                current += s.slotDuration
            }
        }

        return {
            slots: slots.sort((a, b) => a.getTime() - b.getTime())
        }
    },
    registerAppointment: async (patientId, data) => {
        validateMissingFields(data, ['doctorId', 'appointmentDate'])

        const { doctorId, appointmentDate } = data

        if (!Number.isInteger(Number(doctorId))) {
            throw new BadrequestException('Bác sĩ không hợp lệ')
        }

        if (isNaN(new Date(appointmentDate).getTime())) {
            throw new BadrequestException("Ngày giờ khám không hợp lệ")
        }

        const doctor = await prisma.user.findUnique({
            where: { id: Number(doctorId) },
            include: { department: true }
        })

        if (!doctor) {
            throw new NotFoundException('Không tìm thấy bác sĩ này')
        }

        if (!doctor.department) {
            throw new BadrequestException('Bác sĩ chưa được phân khoa')
        }

        const departmentId = doctor.department.id

        const appointmentDateTime = new Date(appointmentDate)
        const dayOfWeek = appointmentDateTime.getDay()
        const minutes = appointmentDateTime.getHours() * 60 + appointmentDateTime.getMinutes()


        const schedule = await prisma.doctorSchedule.findFirst({
            where: {
                doctorId: Number(doctorId),
                dayOfWeek,
                startTime: { lte: minutes },
                endTime: { gte: minutes }
            }
        })

        if (!schedule) {
            throw new BadrequestException('Bác sĩ không làm việc giờ này')
        }


        const existing = await prisma.appointment.findFirst({
            where: {
                doctorId: Number(doctorId),
                appointmentDate: appointmentDateTime
            }
        })

        if (existing) {
            throw new BadrequestException('Khung giờ này đã được đặt')
        }

        const code = await generateAppointCode()

        const appointment = await prisma.appointment.create({
            data: {
                code,
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                departmentId,
                appointmentDate: appointmentDateTime
            }
        })

        return { appointment }
    },
    getAllAppointments: async (patientId) => {
        const now = new Date

        const appointments = await prisma.appointment.findMany({
            where: {
                status: 'PENDING',
                patientId: Number(patientId),
                appointmentDate: {
                    gt: now
                }
            },
            orderBy: {
                appointmentDate: 'asc'
            },
            select: {
                id: true,
                code: true,
                appointmentDate: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                doctor: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                        avatar : true
                    }
                }
            }
        })
        return {
            appointments
        }
    },
    requestCancelAppointment: async (patientId, appointmentId, data) => {
        const { note } = data

        const appointment = await prisma.appointment.findFirst({
            where: {
                id: Number(appointmentId),
                patientId: patientId
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lich khám của người dùng này')
        }
        const cancelAppointment = await prisma.appointmentRequest.create({
            data: {
                appointmentId: Number(appointmentId),
                patientId: Number(patientId),
                note: note ? note.trim() : null,
                type: 'CANCEL'
            }
        })
        return {
            cancelAppointment
        }
    },
    requestAppointment: async (patientId, appointmentId, data) => {
        const { note, newDoctorId, newDate, type } = data
        const now = new Date
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: Number(appointmentId),
                patientId: patientId
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lich khám của người dùng này')
        }
        if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status)) {
            throw new BadrequestException("Không thể gửi yêu cầu thay đổi lịch này")
        }
        const existedRequest = await prisma.appointmentRequest.findFirst({
            where: {
                appointmentId: Number(appointmentId),
                status: "PENDING"
            }
        })

        if (existedRequest) {
            throw new BadrequestException("Đã có yêu cầu đang chờ xử lý")
        }
        if (appointment.appointmentDate <= now) {
            throw new BadrequestException("Không thể thay đổi lịch khi đã đến giờ khám")
        }

        const resquestAppointment = await prisma.appointmentRequest.create({
            data: {
                appointmentId: Number(appointmentId),
                patientId: Number(patientId),

                oldDoctorId: appointment.doctorId,
                oldDate: appointment.appointmentDate,

                note: note ? note.trim() : null,

                newDoctorId: newDoctorId ? Number(newDoctorId) : null,
                newDate: newDate ? new Date(newDate) : null,
                type: type

            }
        })
        return {
            resquestAppointment
        }
    },
    getHistoryRequestAppointment: async (patientId) => {
        const request = await prisma.appointmentRequest.findMany({
            where: {
                status: {
                    in: ['PENDING','APPROVED', 'REJECTED']
                },
                patientId: Number(patientId)
            },
            select: {
                status: true,
                type: true,
                oldDoctor: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                oldDate: true,
                newDoctor: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                newDate: true,
                note: true,
                type: true,
                reviewedBy: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                reviewedAt: true
            },
        })
        return {
            request
        }
    },
}