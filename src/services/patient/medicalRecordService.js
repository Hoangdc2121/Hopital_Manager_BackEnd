import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const medicalRecordService = {
    getAllAppointmentsSucces: async () => {
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "COMPLETED"
            },
            orderBy: { appointmentDate: 'desc' },
            include: {
                patient: true,
                department: true,
                doctor: true
            }
        })
        return {
            appointments
        }
    },
    getMedicalRecordByAppointment: async (appointmentId) => {
        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy cuộc hẹn này')
        }

        const record = await prisma.medicalRecord.findUnique({
            where: {
                appointmentId: Number(appointmentId)
            },
            select: {
                appointment: {
                    select: {
                        code: true,
                        appointmentDate: true,
                        status: true,
                        medicalRecord: {
                            select: {
                                id: true,
                                symptoms: true,
                                diagnosis: true,
                                conclusion: true
                            }
                        },
                        vitalSigns: {
                            select: {
                                id: true,
                                bloodPressure: true,
                                heartRate: true,
                                temperature: true,
                                spo2: true,
                                respiratoryRate: true,
                                height: true,
                                weight: true,
                                note : true,
                                recordedBy: {
                                    select: {
                                        id: true,
                                        fullName: true
                                    }
                                }
                            }
                        }
                    }
                },
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
                },
                patient: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                prescriptions: {
                    include: {
                        items: {
                            include: {
                                medicine: true
                            }
                        }
                    }
                }
            }
        })
        return {
            record
        }
    }
}