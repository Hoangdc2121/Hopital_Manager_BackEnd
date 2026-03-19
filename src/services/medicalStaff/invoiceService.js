import prisma from "../../common/prisma/initPrisma";

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
        const invoices = await prisma.invoice.findMany({
            where : whereCondition,
            take : limit,
            // skip : skip,
            // include : 

        })
    }
}