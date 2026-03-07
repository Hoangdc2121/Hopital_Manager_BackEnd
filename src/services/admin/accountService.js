import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"
import validatePassword from "../../utils/validatePassword.js"
import bcrypt from 'bcrypt'
export const accountService = {
    createAccount: async (data, avatarPath) => {
        validateMissingFields(data, ['fullName', 'email', 'password', 'role'])
        const { fullName, email, password, role, phoneNumber, departmentId } = data

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException('Tên không hợp lệ')
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException('email không hợp lệ')
        }
        if (!email.endsWith('@gmail.com')) {
            throw new BadrequestException('Email phải có đuôi là @gmail.com')
        }
        validatePassword(password)
        let department = null

        if (departmentId !== undefined) {
            department = await prisma.department.findUnique({
                where: { id: Number(departmentId) }
            })

            if (!department) {
                throw new NotFoundException('Không tìm thấy khoa này')
            }
        }
        const extingEmail = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if (extingEmail) {
            throw new ConflictException('Đã tồn tại email này')
        }
        const hashpassword = await bcrypt.hash(password, 10);

        const newAccount = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                password: hashpassword,
                phoneNumber: phoneNumber?.trim() || null,
                avatar: avatarPath ? avatarPath : null,
                role: role,
                departmentId: Number(departmentId)
            }
        })
        return {
            newAccount
        }
    },
    updateInfoAccount: async (accountId, data, avatarPath) => {
        const { fullName, email, role, phoneNumber, gender, dateOfBirth, address, departmentId } = data
        const account = await prisma.user.findUnique({
            where: { id: Number(accountId) }
        })
        if (!account) {
            throw new NotFoundException('Không tìm thấy người dùng này')
        }
        const updateData = {}
        if (fullName !== undefined) updateData.fullName = fullName.trim()
        if (email !== undefined) updateData.email = email.trim()
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim()
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim()
        if (role) updateData.role = role
        if (gender) updateData.gender = gender
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
        if (address !== undefined) updateData.address = address.trim()
        if (departmentId !== undefined) {
            let department = null
            department = await prisma.department.findUnique({
                where: { id: Number(departmentId) }
            })

            if (!department) {
                throw new NotFoundException('Không tìm thấy khoa này')
            }
        }
        if (avatarPath) updateData.avatar = avatarPath

        const updateInfoAccount = await prisma.user.update({
            where: { id: Number(accountId) },
            data: updateData
        })
        return {
            updateInfoAccount
        }
    },
    updateAccountStatus: async (accountId) => {
        const account = await prisma.user.findUnique({
            where: { id: Number(accountId) }
        })
        if (!account) {
            throw new NotFoundException('Không tìm thấy người dùng này')
        }
        const updateAccountStatus = await prisma.user.update({
            where: { id: Number(accountId) },
            data: {
                isActive: !account.isActive
            }
        })
        return {
            updateAccountStatus
        }
    },
    getAllAcounts: async (adminId, role, search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            id: {
                not: adminId
            },
            role: {
                not: "PATIENT"
            },
            ...(role ? {
                role: {
                    contains: role
                }
            } : {}),
            ...(search ? {
                fullName: {
                    contains: search.toLowerCase()
                }
            } : {}),
        }
        const [accounts, totalAccounts] = await Promise.all([
            prisma.user.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    department: true
                }
            }),
            prisma.user.count({
                where: whereCondition
            })
        ])
        return {
            accounts,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalAccounts,
                totalPages: Math.ceil(totalAccounts / limit)
            }
        }
    },
    getInfoAccount: async (accountId) => {
        const account = await prisma.user.findUnique({
            where: { id: Number(accountId) },
            include: {
                department: true
            }
        })
        if (!account) {
            throw new NotFoundException('Không tìm thấy người dùng này')
        }
        return {
            account
        }
    },
    getAllPatients: async (search, gender, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            role: "PATIENT",
            ...(search ? {
                fullName: {
                    contains: search.toLowerCase()
                }
            } : {}),
            ...(gender ? {
                gender: {
                    contains: gender
                }
            } : {})
        }
        const [patients, totalPatient] = await Promise.all([
            prisma.user.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            patientAppointments: true
                        }
                    }
                }
            }),
            prisma.user.count({
                where: whereCondition
            })
        ])
        return {
            patients,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalPatient,
                totalPages: Math.ceil(totalPatient / limit)
            }
        }
    },
    getOverViewPatient: async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const [totalPatients, newPatients, patientsLock] = await Promise.all([
            prisma.user.count({
                where: {
                    role: 'PATIENT'
                }
            }),
            prisma.user.count({
                where: {
                    role: 'PATIENT',
                    createdAt: {
                        gte: today
                    }
                }
            }),
            prisma.user.count({
                where: {
                    role: 'PATIENT',
                    isActive: false
                }
            })
        ])
        return {
            totalPatients,
            newPatients,
            patientsLock
        }
    },
    getOverViewStaff: async () => {
        const [totalStaffs, totalDoctors, totalMedicalStaffs, staffsLock] = await Promise.all([
            prisma.user.count({
                where: {
                    role: {
                        in: ['DOCTOR', 'MEDICAL_STAFF']
                    }
                }
            }),
            prisma.user.count({
                where: {
                    role: 'DOCTOR'
                }
            }),
            prisma.user.count({
                where: {
                    role: 'MEDICAL_STAFF'
                }
            }),
            prisma.user.count({
                where: {
                    role: {
                        in: ['DOCTOR', 'MEDICAL_STAFF']
                    },
                    isActive : false
                }
            }),
        ])
        return {
            totalStaffs,
            totalDoctors,
            totalMedicalStaffs,
            staffsLock
        }
    }
}