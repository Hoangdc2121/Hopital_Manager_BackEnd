import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import bcrypt from 'bcrypt'
import validatePassword from "../../utils/validatePassword.js"
import validateMissingFields from "../../utils/validateFields.js"
export const profileService = {
    getInfoPatient: async (patientId) => {
        const patient = await prisma.user.findUnique({
            where: {
                id: patientId
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                gender: true,
                dateOfBirth: true,
                phoneNumber: true,
                address: true,
            }
        })
        if (!patient) {
            throw new NotFoundException('Không tìm thấy bệnh nhân này')
        }
        return {
            patient
        }
    },
    updateInfoPatient: async (patientId, data, avatarPath) => {
        const { fullName, email, gender, dateOfBirth, phoneNumber, address } = data
        const updateData = {}
        const patient = await prisma.user.findUnique({
            where: {
                id: patientId
            }
        })
        if (!patient) {
            throw new NotFoundException('Không tìm thấy bệnh nhân này')
        }
        if (fullName !== undefined) {
            if (typeof fullName !== 'string' || fullName.trim() === '') {
                throw new BadrequestException('Tên không hợp lệ')
            }
            updateData.fullName = fullName.trim()
        }
        if (email !== undefined) {
            if (!email.endsWith('@gmail.com')) {
                throw new BadrequestException('Gmail phải có đuôi là @gmail.com')
            }
            updateData.email = email.trim()
        }

        if (gender !== undefined) updateData.gender = gender
        if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)
        if (phoneNumber !== undefined) updateData.phoneNumber = Number(phoneNumber)
        if (address !== undefined) updateData.address = address.trim()
        if (avatarPath !== undefined) updateData.avatar = avatarPath

        const updateProfile = await prisma.user.update({
            where: {
                id: patientId
            },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                gender: true,
                dateOfBirth: true,
                phoneNumber: true,
                address: true,
            }
        })
        return {
            updateProfile
        }
    },
    resetPassword: async (patientId, data) => {
        validateMissingFields(data, ['oldPassword', 'newPassword', 'confirmPassword'])
        const { oldPassword, newPassword, confirmPassword } = data
        validatePassword(newPassword)
        if (newPassword !== confirmPassword) {
            throw new BadrequestException('Mật khẩu mới và mật khẩu xac nhận không giống nhau')
        }
        const patient = await prisma.user.findUnique({
            where: {
                id: patientId
            }
        })
        if (!patient) {
            throw new NotFoundException('Không tìm thấy bệnh nhân này')
        }
        const isMatch = await bcrypt.compare(oldPassword, patient.password)
        if (!isMatch) {
            throw new BadrequestException('Mật khẩu cũ không đúng')
        }
        const hashPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: {
                id: patientId
            },
            data: {
                password: hashPassword
            }
        })
    }
}