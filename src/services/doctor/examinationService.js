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
   createPrescriptionAndInvoice: async (data) => {
    const { medicalRecordId, appointmentId, medicines } = data

    if (!medicalRecordId || !appointmentId || !Array.isArray(medicines) || medicines.length === 0) {
        throw new BadrequestException("Thiếu thông tin kê thuốc")
    }

    return await prisma.$transaction(async (tx) => {

   
        const appointment = await tx.appointment.findUnique({
            where: { id: Number(appointmentId) }
        })

        if (!appointment) {
            throw new NotFoundException("Không tìm thấy lịch khám")
        }

        const patientId = appointment.patientId

    
        const prescription = await tx.prescription.create({
            data: { medicalRecordId: Number(medicalRecordId) }
        })

        let totalAmount = 0

      
        const invoice = await tx.invoice.create({
            data: {
                appointmentId: Number(appointmentId),
                totalAmount: 0,
                payments: {
                    create: {
                        userId: patientId,
                        amount: 0,
                        method: "CASH", 
                        status: "PENDING"
                    }
                }
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
                data: {
                    stock: { decrement: m.quantity }
                }
            })
        }

    
        await tx.invoice.update({
            where: { id: invoice.id },
            data: { totalAmount }
        })

     
        await tx.payment.updateMany({
            where: { invoiceId: invoice.id },
            data: { amount: totalAmount }
        })

        await tx.appointment.update({
            where: { id: Number(appointmentId) },
            data: { status: "COMPLETED" }
        })

        return { prescription, invoice }
    })
},
    getAllMedicine : async () => {
        const medicine = await prisma.medicine.findMany({
            where : {
                isActive : true
            },
        })
        return {
            medicine
        }
    }
}