import prisma from "../../common/prisma/initPrisma.js"

export const medicineService = {
    getAllMedicine: async (search) => {
        const whereCondition = {
            isActive: true,
            ...(search ? {
                name: search
            } : {})
        }
        const medicine = await prisma.medicine.findMany({
            where: whereCondition
        })
        return {
            medicine
        }
    }
}