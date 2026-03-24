import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const examinationService = {
    examinationPatient: async (doctorId, appointmentId) => {
        const appointment = await prisma.appointment.findFirst({
            where: {
                id: Number(appointmentId),
                doctorId: doctorId
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch này')
        }
        const examinationPatient = await prisma.appointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: doctorId
            },
            data: {
                status: 'IN_PROGRESS'
            }
        })
        return {
            examinationPatient
        }

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



        const now = new Date()

        const startOfDayVN = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
        )


        const startDateVN = new Date(startOfDayVN.getTime() + schedule.startTime * 60 * 1000)
        const endDateVN = new Date(startOfDayVN.getTime() + schedule.endTime * 60 * 1000)


        const startDate = new Date(startDateVN.toISOString())
        const endDate = new Date(endDateVN.toISOString())

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
    createMedicalRecord: async (doctorId,appointmentId, data) => {
        validateMissingFields(data, ['symptoms', 'diagnosis', 'conclusion'])
        const {symptoms, diagnosis, conclusion } = data

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: Number(appointmentId)
            }
        })
        if (!appointment) {
            throw new NotFoundException('Không tìm thấy lịch khám này')
        }
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
                appointmentId: Number(appointmentId),
                doctorId: doctorId,
                patientId: appointment.patientId,
                symptoms: symptoms.trim(),
                diagnosis: diagnosis.trim(),
                conclusion: conclusion.trim()
            }
        })
        return {
            medicalRecord
        }
    },
    createPrescriptionAndInvoice: async (medicalRecordId,data) => {
        const {medicines, note, advice, followUpAt } = data

        if (!medicalRecordId || !Array.isArray(medicines) || medicines.length === 0) {
            throw new BadrequestException("Thiếu thông tin kê thuốc")
        }


        return await prisma.$transaction(async (tx) => {


            const medicalRecord = await tx.medicalRecord.findUnique({
                where: { id: Number(medicalRecordId) },
                include: {
                    appointment: {
                        include: { invoice: true }
                    }
                }
            })

            if (!medicalRecord) {
                throw new NotFoundException("Không tìm thấy hồ sơ bệnh án")
            }

            const appointment = medicalRecord.appointment

            if (appointment.invoice) {
                throw new BadrequestException("Lịch khám đã có hóa đơn")
            }


            const prescription = await tx.prescription.create({
                data: {
                    medicalRecordId: Number(medicalRecordId),
                    note: note ? note.trim() : "",
                    advice: advice ? advice.trim() : "",
                    followUpAt: new Date(followUpAt)
                }
            })

            let totalAmount = 0

            const invoice = await tx.invoice.create({
                data: {
                    appointmentId: medicalRecord.appointmentId,
                    totalAmount: 0,
                    status: "UNPAID"
                }
            })


            for (const m of medicines) {
                const medicine = await tx.medicine.findUnique({
                    where: { id: Number(m.medicineId) }
                })

                if (!medicine) {
                    throw new NotFoundException("Không tìm thấy thuốc")
                }

                if (medicine.stock < m.quantity) {
                    throw new BadrequestException(`Thuốc ${medicine.name} không đủ số lượng`)
                }

                const itemTotal = medicine.price * m.quantity
                totalAmount += itemTotal


                await tx.prescriptionItem.create({
                    data: {
                        prescriptionId: prescription.id,
                        medicineId: Number(m.medicineId),
                        dosage: m.dosage,
                        days: m.days,
                        quantity: m.quantity,
                        price: medicine.price
                    }
                })


                await tx.invoiceItem.create({
                    data: {
                        invoiceId: invoice.id,
                        type: "MEDICINE",
                        name: medicine.name,
                        price: medicine.price,
                        quantity: m.quantity
                    }
                })


                await tx.medicine.update({
                    where: { id: Number(m.medicineId) },
                    data: { stock: { decrement: m.quantity } }
                })
            }


            await tx.invoice.update({
                where: { id: invoice.id },
                data: { totalAmount }
            })


            await tx.appointment.update({
                where: { id:medicalRecord.appointmentId },
                data: { status: "COMPLETED" }
            })

            return { prescription }
        })
    },
}