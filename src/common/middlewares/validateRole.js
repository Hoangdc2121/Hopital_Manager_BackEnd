import { ForbiddenException } from "../helpers/exception.helper.js";

export const validateAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        throw new ForbiddenException("Chỉ ADMIN mới có quyền truy cập tài nguyên này");
    }
    next()
}

export const validateDoctor = (req, res, next) => {
    if (req.user.role !== 'DOCTOR') {
        throw new ForbiddenException("Chỉ DOCTOR mới có quyền truy cập tài nguyên này");
    }
    next()
}

export const validateMedicalStaff = (req, res, next) => {
    if (req.user.role !== 'MEDICAL_STAFF') {
        throw new ForbiddenException("Chỉ MEDICAL_STAFF mới có quyền truy cập tài nguyên này");
    }
    next()
}

export const validatePatient = (req, res, next) => {
    if (req.user.role !== 'PATIENT') {
        throw new ForbiddenException("Chỉ PATIENT mới có quyền truy cập tài nguyên này");
    }
    next()
}