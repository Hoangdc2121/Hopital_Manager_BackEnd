import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js";
import prisma from "../../common/prisma/initPrisma.js";

export const invoiceService = {
    getAllInvoices: async (search,status,page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit

        const whereCondition ={
            ...(search ? {
                appointment : {
                    patient : {
                        fullName : search
                    }
                }
            }: {}),
            ...(status ? {
                status : status
            } : {})
        }
        const [invoices,totalInvoices] = await Promise.all([
            prisma.invoice.findMany({
            where : whereCondition,
            take : limit,
            skip : skip,
            include : {
                appointment : {
                    include : {
                        patient : true,
                        doctor : true
                    }
                }
            }
        }),
        prisma.invoice.count({
            where : whereCondition
        })
        ]) 
        return {
            invoices,
            pagination: {
                page : Number(page),
                limit : limit,
                total : totalInvoices,
                totalPages: Math.ceil(totalInvoices/limit)
            }
        }
    },
    ConfirmPaymentInvoice: async (invoiceId,medicalId) => {
        const invoice = await prisma.invoice.findUnique({
            where : {
                id : Number(invoiceId)
            },
            include : {
                appointment : true
            }
        })

        if(!invoice) {
            throw new NotFoundException('Không tìm thấy hóa đơn này')
        }
        if(invoice.status === 'PAID') {
            throw new BadrequestException('Hóa đơn này đã thanh toán')
        }

        const succesPaymentInvoice = await prisma.payment.create({
            data : {
                invoiceId : Number(invoiceId),
                patientId : invoice.appointment.patientId,
                medicalStaffId : medicalId,
                amount : invoice.totalAmount,
                method : 'CASH',
                status : 'SUCCESS',
                paidAt : new Date()
            }
        })
        await prisma.invoice.update({
            where : {
                id : Number(invoiceId)
            },
            data : {
                status : 'PAID'
            }
        })
        return {
            succesPaymentInvoice
        }
    }
}