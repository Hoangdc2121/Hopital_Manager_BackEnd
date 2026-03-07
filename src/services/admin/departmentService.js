import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js";
import generateDepartmentCode from "../../common/helpers/generateDepartmentCode.js";
import prisma from "../../common/prisma/initPrisma.js";
import validateMissingFields from "../../utils/validateFields.js";

export const departmentService = {
    createDepartment: async (data) => {
        validateMissingFields(data, ['name'])
        const { name } = data;
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên khoa không hợp lệ")
        }

        const existingDepartment = await prisma.department.findFirst({ where: { name: name.trim() } })
        if (existingDepartment) {
            throw new ConflictException("Khoa này đã tồn tại")
        }
        const baseCode = generateDepartmentCode(name.trim())
        let departmentCode = baseCode;
        let index = 1;
        while (await prisma.department.findUnique({ where: { code: departmentCode } })) {
            departmentCode = `${baseCode}-${index}`
            index++
        }
        const newDepartment = await prisma.department.create({
            data: {
                name: name.trim(),
                code: departmentCode
            }
        })
        return {
            newDepartment
        }
    },
    updateDepartmentInfo: async (departmentId, data) => {
        validateMissingFields(data, ['name'])
        const { name } = data;
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên khoa không hợp lệ")
        }

        const [department,existingDepartment] = await Promise.all([
            prisma.department.findUnique({ where: { id: Number(departmentId) } }),
            prisma.department.findFirst({
                where: {
                    name: name.trim(),
                    NOT: {
                        id: Number(departmentId)
                    }
                }
            }),
        ])
        if (!department) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        if (existingDepartment) {
            throw new ConflictException("Khoa này đã tồn tại")
        }
        const updateDepartmentInfo = await prisma.department.update({
            where: { id: Number(departmentId) },
            data: {
                name: name.trim()
            }
        })
        return {
            updateDepartmentInfo
        }
    },
    updateDepartmentStatus: async (departmentId) => {
        const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } })
        if (!department) {
            throw new NotFoundException("Khoa không tồn tại")
        }
        const updateDepartmentStatus = await prisma.department.update({
            where: { id: Number(departmentId) },
            data: {
                isActive: !department.isActive
            }
        })
        return {
            updateDepartmentStatus
        }

    },
    getAllDepartments: async (search, page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit;
        const whereCondition = { ...(search ? { name: { contains: search.toLowerCase() } } : {}) }

        const [departments, totalDepartments] = await Promise.all([
            prisma.department.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.department.count({
                where: whereCondition
            })
        ])
        return {
            departments,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalDepartments,
                totalPages: Math.ceil(totalDepartments / limit)
            }
        }
    },
    getAllDepartmentsSimple: async () => {
        const departments = await prisma.department.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                code: true,
                name: true
            }
        })
        return {
            departments
        }
    }
}