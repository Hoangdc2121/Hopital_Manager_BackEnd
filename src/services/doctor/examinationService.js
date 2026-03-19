import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper"
import prisma from "../../common/prisma/initPrisma"
import validateMissingFields from "../../utils/validateFields"

export const examinationService = {
    examinationPatient: async (appointmentId, doctorId) => {
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: Number(appointmentId),
                doctorId: doctorId
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch này')
        }
        await prisma.appointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: doctorId
            },
            data: {
                status: 'IN_PROGRESS'
            }
        })

    },
    getOverviewExamination: async (doctorId) => {
        const [totalPatiens, totalExaminationsPending, totalExaminationsComplete] = await Promise.all([
            prisma.appointment.count({
                where: {
                    doctorId: doctorId,
                    status: {
                        in: ['WAITING', 'IN_PROGRESS', 'COMPLETED']
                    }
                }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctorId,
                    status: 'WAITING'
                }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctorId,
                    status: 'COMPLETED'
                }
            })
        ])
        return {
            totalPatiens,
            totalExaminationsPending,
            totalExaminationsComplete

        }
    },
    getAllExaminationDoctor: async (doctorId, scheduleId, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const schedule = await prisma.doctorSchedule.findUnique({
            where: {
                id: Number(scheduleId)
            }
        })
        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch này')
        }

        const today = new Date()
        const startDate = new Date(today)
        startDate.setHours(schedule.startTime, 0, 0, 0)
        const endDate = new Date(today)
        endDate.setHours(schedule.endTime, 0, 0, 0)

        const [appointments, totalAppointments] = await Promise.all([
            prisma.appointment.findMany({
                where: {
                    doctorId: doctorId,
                    status: {
                        in: ['WAITING', 'IN_PROGRESS']
                    },
                    appointmentDate: {
                        gte: startDate,
                        lt: endDate
                    },
                },
                take: limit,
                skip: skip,
                include: {
                    patient: true,
                    doctor: true,
                    vitalSigns: {
                        include: {
                            recordedBy: true
                        }
                    }
                },
                orderBy: {
                    appointmentDate: 'asc'
                }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctorId,
                    status: {
                        in: ['WAITING', 'IN_PROGRESS']
                    },
                    appointmentDate: {
                        gte: startDate,
                        lt: endDate
                    },
                }
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
    getInfoVitalSign: async (appointmentId) => {
        const vitalSign = await prisma.vitalSign.findFirst({
            where: {
                appointmentId: Number(appointmentId)
            },
            include: {
                appointment: {
                    include: {
                        patient: true
                    }
                },
                recordedBy: true
            }
        })
        return {
            vitalSign
        }
    },
    createMedicalRecord: async (doctorId, data) => {
        validateMissingFields(data, ['symptoms', 'diagnosis', 'conclusion'])
        const { appointmentId, symptoms, diagnosis, conclusion } = data

        if (typeof symptoms !== 'string' || symptoms.trim() === '') {
            throw new BadrequestException('Triệu chứng không hợp lệ')
        }
        if (typeof diagnosis !== 'string' || diagnosis.trim() === '') {
            throw new BadrequestException('Chuẩn đoán không hợp lệ')
        }
        if (typeof conclusion !== 'string' || conclusion.trim() === '') {
            throw new BadrequestException('Kết luận không hợp lệ')
        }

        const medicalRecord = await prisma.medicalRecord.create({
            data: {
                appointmentId: appointmentId,
                doctorId: doctorId,
                symptoms: symptoms.trim(),
                diagnosis: diagnosis.trim(),
                conclusion: conclusion.trim()
            }
        })
        return {
            medicalRecord
        }
    },
    createPrescription: async (doctorId, data) => {
        const { medicalRecordId, medicines } = data
        if (!medicalRecordId || !Array.isArray(medicines) || medicines.length === 0) {
            throw new BadrequestException("Thiếu thông tin kê thuốc")
        }
        return await prisma.$transaction( async (tx) => {
            const prescription = await tx.prescription.create({
                data : {
                    medicalRecordId : Number(medicalRecordId)
                }
            })
            for (const m of medicines) {
                
            }
        })

    }
}