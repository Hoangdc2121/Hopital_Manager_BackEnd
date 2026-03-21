import prisma from "../../common/prisma/initPrisma.js"

export const paymentService = {
    getHistoryPayments: async (patientId) => {
        const payments = await prisma.payment.findMany({
            where : {
                patientId : patientId
            },
            include : {
                invoice : {
                    include : {
                        appointment : {
                            include : {
                                doctor : true,
                                patient : true
                            }
                        }
                    }
                }
            }
        })
        return {
            payments
        }
    }
}