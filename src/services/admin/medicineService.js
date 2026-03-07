import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const medicineService = {
    createMedicine: async (data) => {
        validateMissingFields(data, ['name', 'unit', 'price', 'stock'])
        const { name, unit, price, stock } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException('Tên thuốc không hợp lệ')
        }
        if (typeof unit !== 'string' || unit.trim() === '') {
            throw new BadrequestException('Đơn vị thuốc không hợp lệ')
        }
        if (!Number.isInteger(Number(price))) {
            throw new BadrequestException('Giá thuốc không hợp lệ')
        }
        if (!Number.isInteger(Number(stock))) {
            throw new BadrequestException('Số lượng tồn kho không hợp lệ')
        }

        const existingName = await prisma.medicine.findFirst({
            where: { name: name.trim() }
        })
        if (existingName) {
            throw new ConflictException('Tên thuốc này đã tồn tại')
        }

        const medicine = await prisma.medicine.create({
            data: {
                name: name.trim(),
                unit: unit.trim(),
                price: Number(price),
                stock: Number(stock)
            }
        })
        return {
            medicine
        }
    },
    updateInfoMedicine: async (medicineId, data) => {
        const { name, unit, price, stock } = data
        const medicine = await prisma.medicine.findUnique({
            where: { id: Number(medicineId) }
        })
        if (!medicine) {
            throw new NotFoundException('Không tìm thấy thuốc này')
        }
        const updateData = {}
        if (name !== undefined) updateData.name = name.trim()
        if (unit !== undefined) updateData.unit = unit.trim()
        if (price !== undefined) updateData.price = Number(price)
        if (stock !== undefined) updateData.stock = Number(stock)

        const updateInfoMedicine = await prisma.medicine.update({
            where: { id: Number(medicineId) },
            data: updateData
        })
        return {
            updateInfoMedicine
        }
    },
    updateMedicineStatus: async (medicineId) => {
        const medicine = await prisma.medicine.findUnique({
            where: { id: Number(medicineId) }
        })
        if (!medicine) {
            throw new NotFoundException('Không tìm thấy thuốc này')
        }

        const updateMedicineStatus = await prisma.medicine.update({
            where: { id: Number(medicineId) },
            data: {
                isActive: !medicine.isActive
            }
        })
        return {
            updateMedicineStatus
        }
    },
    getAllMedicines: async (search, page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit
        const whereCondition = search ? {
            OR: [
                {
                    name: {
                        contains: search.toLowerCase()
                    }
                },
                {
                    unit: {
                        contains: search.toLowerCase()
                    }
                },
                ...(!isNaN(search)
                    ? [
                        {
                            price: Number(search)
                        },
                        {
                            stock: Number(search)
                        }
                    ]
                    : [])
            ]
        } : {}

        const [medicines, totalMedicines] = await Promise.all([
            prisma.medicine.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.medicine.count({
                where: whereCondition
            })
        ])
        return {
            medicines,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalMedicines,
                totalPages: Math.ceil(totalMedicines / limit)
            }
        }
    },
    getAllMedicinesSimple: async () => {
        const medicines = await prisma.medicine.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select : {
                id : true,
                name : true,
                unit : true,
                price : true,
                stock: true
            }
        })
        return {
            medicines
        }
    }
}