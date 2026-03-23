import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const appointmentService = {
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
                            avatar: true,
                            phoneNumber: true,
                            role: true
                        }
                    },
                    doctor: {
                        select: {
                            id: true,
                            fullName: true,
                            avatar: true,
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
                id: Number(appointmentId)
            },
            data: {
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
                content: `Lịch khám lúc ${timeStr} ngày ${dateStr} với bác sĩ ${appointment.doctor.fullName} (${appointment.department.name}) đã bị hủy.${reason ? ` Lý do: ${reason}` : ''}`
            }
        })
    },
    changeAppointment: async (appointmentId, data) => {
        const { newDate, newDoctorId, reason } = data

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            },
            include: {
                doctor: true
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch này')
        }
        if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
            throw new BadrequestException('Không thể đổi lịch này')
        }
        if (newDate && new Date(newDate) < new Date()) {
            throw new BadrequestException('Không thể chọn thời gian trong quá khứ')
        }

        const finalDoctorId = newDoctorId ? newDoctorId : appointment.doctorId
        const finalDate = newDate ? new Date(newDate) : appointment.appointmentDate
        const exist = await prisma.appointment.findFirst({
            where: {
                doctorId: finalDoctorId,
                appointmentDate: finalDate,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS']
                },
                NOT: {
                    id: appointment.id
                }
            }
        })

        if (exist) {
            throw new BadrequestException('Khung giờ đã có người đặt')
        }
        let newDoctorName = appointment.doctor.fullName

        if (newDoctorId) {
            const newDoctor = await prisma.user.findUnique({
                where: { id: Number(newDoctorId) }
            })

            if (!newDoctor) {
                throw new NotFoundException('Không tìm thấy bác sĩ mới')
            }

            newDoctorName = newDoctor.fullName
        }
        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                appointmentDate: finalDate,
                doctorId: finalDoctorId
            }
        })


        const oldDateStr = new Date(appointment.appointmentDate).toLocaleString()
        const newDateStr = new Date(updated.appointmentDate).toLocaleString()
        let content = `
        Lý do : ${reason}\n
        Lịch khám của bạn đã được thay đổi:\n`


        if (newDoctorId && newDoctorId !== appointment.doctorId) {
            content += `Bác sĩ: ${appointment.doctor.fullName} → ${newDoctorName}\n`
        }


        if (newDate && new Date(newDate).getTime() !== new Date(appointment.appointmentDate).getTime()) {
            content += `Thời gian: ${oldDateStr} → ${newDateStr}`
        }

        await prisma.notification.create({
            data: {
                userId: appointment.patientId,
                title: 'Lịch khám đã thay đổi',
                content
            }
        })
    },
    approveRequest: async (requestId, medicalId) => {
        const request = await prisma.appointmentRequest.findUnique({
            where: {
                id: Number(requestId)
            },
            include: {
                newDoctor: true,
                oldDoctor: true,
                
            }
        })
        if (!request) {
            throw new NotFoundException('Không tìm thấy yêu cầu này')
        }

        const updateData = {}

        if (request.type === 'CHANGE_TIME') {
            updateData.appointmentDate = request.newDate
        }
        if (request.type === 'CHANGE_DOCTOR') {
            updateData.doctorId = request.newDoctorId
            updateData.appointmentDate = request.newDate
        }
        if (request.type === 'CANCEL') {
            updateData.status = 'CANCELLED'
        }

        await prisma.appointment.update({
            where: {
                id: Number(request.appointmentId)
            },
            data: updateData
        }),
            await prisma.appointmentRequest.update({
                where: { id: request.id },
                data: {
                    status: 'APPROVED',
                    reviewedById: medicalId,
                    reviewedAt: new Date()
                }
            })

        const formatVNDateTime = (isoString) => {
            const d = new Date(isoString)
            return d.toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour12: false,
                timeZone: "Asia/Ho_Chi_Minh"
            })
        }
        let title = ""
        let content = ""

        if (request.type === 'CANCEL') {
            title = "Yêu cầu hủy lịch của bạn đã được chấp nhận"
            content = `Lịch hẹn với BS. ${request.oldDoctor.fullName} vào ${formatVNDateTime(request.oldDate)} đã được hủy thành công.`
        }
        if (request.type === 'CHANGE_TIME') {
            title = "Yêu cầu dời lịch hẹn thành công"
            content = `Lịch hẹn với BS. ${request.oldDoctor.fullName} đã được dời: 
              Từ : ${formatVNDateTime(request.oldDate)}  
              Sang : ${formatVNDateTime(request.newDate)}  
              `
        }
        if (request.type === 'CHANGE_DOCTOR') {
            title = "Yêu cầu dời bác sĩ thành công"
            content = `Lịch hẹn với BS.${request.oldDate.fullName} đã được dời
              Sang : BS.${request.newDoctor.fullName}
              Thời gian:
              Từ : ${formatVNDateTime(request.oldDate)}  
              Sang : ${request.newDate ? formatVNDateTime(request.newDate) : formatVNDateTime(request.oldDate)}  
              `
        }
        await prisma.notification.create({
            data: {
                userId: request.patientId,
                title,
                content,
            }
        })
    },
    rejectRequest: async (requestId, medicalId) => {
        const request = await prisma.appointmentRequest.findUnique({
            where: {
                id: Number(requestId)
            },
            include : {
                oldDoctor : true,
                newDoctor : true
            }
        })
        if (!request) {
            throw new NotFoundException('Không tìm thấy yêu cầu này')
        }
        await prisma.appointmentRequest.update({
            where: { id: request.id },
            data: {
                status: 'REJECTED',
                reviewedById: medicalId,
                reviewedAt: new Date()
            }
        })
           const formatVNDateTime = (isoString) => {
            const d = new Date(isoString)
            return d.toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour12: false,
                timeZone: "Asia/Ho_Chi_Minh"
            })
        }
        let title = ""
        let content = ""

        if (request.type === 'CANCEL') {
            title = "Yêu cầu hủy lịch của bạn đã bị từ chối"
            content = `Lịch hẹn với BS. ${request.oldDoctor.fullName} vào ${formatVNDateTime(request.oldDate)} đã bị từ chối
            Vui lòng gửi lại yêu cầu vào lần sau
            .`
        }
        if (request.type === 'CHANGE_TIME') {
            title = "Yêu cầu dời lịch hẹn đã bị từ chối"
            content = `Lịch hẹn với BS. ${request.oldDoctor.fullName} đã bị từ chối
            Vui lòng gửi lại yêu cầu vào lần sau: 
              Từ : ${formatVNDateTime(request.oldDate)}  
              Sang : ${formatVNDateTime(request.newDate)}  
              `
        }
        if (request.type === 'CHANGE_DOCTOR') {
            title = "Yêu cầu dời bác sĩ đã bị từ chối"
            content = `Lịch hẹn với BS.${request.oldDate.fullName} 
              Sang : BS.${request.newDoctor.fullName}
              Thời gian:
              Từ : ${formatVNDateTime(request.oldDate)}  
              Sang : ${request.newDate ? formatVNDateTime(request.newDate) : formatVNDateTime(request.oldDate)} đã bị từ chối
            Vui lòng gửi lại yêu cầu vào lần sau
              `
        }
        await prisma.notification.create({
            data: {
                userId: request.patientId,
                title,
                contentcontent,
            }
        })
    },
    getAllAppointmentConfirm: async (page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit

        const [appointments, totalAppointments] = await Promise.all([
            prisma.appointment.findMany({
                where: {
                    status: 'CONFIRMED',
                },
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
                            avatar: true,
                            role: true
                        }
                    },
                    doctor: {
                        select: {
                            id: true,
                            fullName: true,
                            avatar: true,
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
                where: {
                    status: 'CONFIRMED',
                },
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
    receptionAppointment: async (appointmentId) => {
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
                id: Number(appointmentId)
            },
            data: {
                status: 'WAITING'
            }
        })
    },
    notComeAppointment: async (appointmentId) => {
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
                id: Number(appointmentId)
            },
            data: {
                status: 'NO_SHOW'
            }
        })
    },
    getAllAppointmentReception: async (page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit

        const [appointments, totalAppointments] = await Promise.all([
            prisma.appointment.findMany({
                where: {
                    status: 'WAITING',
                },
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
                            avatar: true,
                            phoneNumber: true,
                            role: true
                        }
                    },
                    doctor: {
                        select: {
                            id: true,
                            fullName: true,
                            avatar: true,
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
                where: {
                    status: 'WAITING',
                },
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
    createVitalSign: async (medicalId, data) => {
        const { appointmentId, bloodPressure, heartRate, temperature, spo2, respiratoryRate, height, weight, note } = data
        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm lấy lịch này')
        }
        if (typeof bloodPressure !== 'string' || bloodPressure.trim() === '') {
            throw new BadrequestException('Huyết áp không hợp lệ')
        }

        if (!Number.isInteger(Number(heartRate))) {
            throw new BadrequestException('Nhịp tim không hợp lệ')
        }
        if (!Number(temperature)) {
            throw new BadrequestException('nhiệt độ không hợp lệ')
        }
        if (!Number.isInteger(Number(spo2))) {
            throw new BadrequestException('spo2 không hợp lệ')
        }
        if (!Number.isInteger(Number(respiratoryRate))) {
            throw new BadrequestException('Nhịp thở không hợp lệ')
        }
        if (!Number(height)) {
            throw new BadrequestException('chiều cao không hợp lệ')
        }
        if (!Number(weight)) {
            throw new BadrequestException('cân nặng không hợp lệ')
        }

        if (appointment.status !== 'WAITING') {
            throw new BadrequestException('Lịch đã khám xong hoặc chưa được y tế tiếp nhận')
        }


        const exist = await prisma.vitalSign.findFirst({
            where: { appointmentId: Number(appointmentId) }
        })

        if (exist) {
            throw new BadrequestException('Sinh hiệu đã được nhập')
        }
        const vitalSign = await prisma.vitalSign.create({
            data: {
                appointmentId: Number(appointmentId),
                recordedById: medicalId,
                bloodPressure: bloodPressure,
                heartRate: Number(heartRate),
                temperature: Number(temperature),
                spo2: Number(spo2),
                respiratoryRate: Number(respiratoryRate),
                height: Number(height),
                weight: Number(weight),
                note: note ? note.trim() : null
            }
        })
        return {
            vitalSign
        }
    }
}