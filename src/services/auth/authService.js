import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"
import bcrypt from 'bcrypt'
import validatePassword from "../../utils/validatePassword.js"
import generateToken from "../../utils/generateToken.js"
export const authService = {
    registerAdmin: async (data) => {
        validateMissingFields(data, ['fullName', 'email', 'password'])
        const { fullName, email, password } = data

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException('Tên không hợp lệ')
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException('email không hợp lệ')
        }
        if (typeof password !== 'string' || password.trim() === '') {
            throw new BadrequestException('Mật khẩu không hợp lệ')
        }
        if (!email.endsWith('@gmail.com')) {
            throw new BadrequestException('Email phải có đuôi là @gmail.com')
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if (existingEmail) {
            throw new ConflictException("Email này đã tồn tại. Vui lòng sử dụng email khác");
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                password: hashpassword,
                role: 'ADMIN'
            }
        })
        return {
            newAdmin
        }
    },
    registerPatient: async (data) => {
        validateMissingFields(data, ['fullName', 'email', 'password', 'phoneNumber'])
        const { fullName, email, password, phoneNumber } = data
        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException('Tên không hợp lệ')
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException('email không hợp lệ')
        }
        if (typeof password !== 'string' || password.trim() === '') {
            throw new BadrequestException('Mật khẩu không hợp lệ')
        }
        if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
            throw new BadrequestException('phoneNumber không hợp lệ')
        }
        if (!email.endsWith('@gmail.com')) {
            throw new BadrequestException('Email phải có đuôi là @gmail.com')
        }
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if (existingEmail) {
            throw new ConflictException("Email này đã tồn tại. Vui lòng sử dụng email khác");
        }
        validatePassword(password)
        const hashpassword = await bcrypt.hash(password, 10);
        const newPatient = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                password: hashpassword,
                phoneNumber: phoneNumber.trim(),
                role : "PATIENT"
            }
        })
        return {
            newPatient
        }
    },
    login: async (data) => {
        validateMissingFields(data, ['email', 'password'])
        const { email, password } = data

        const user = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này')
        }
        if (!user.isActive) {
            throw new BadrequestException('Tài khoản này đã bị khóa')
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            throw new BadrequestException("Mật khẩu không đúng");
        }
        const token = generateToken(user.id, user.role, user);
        return {
            token
        };
    }
}