import { NotFoundException } from "../../common/helpers/exception.helper"
import prisma from "../../common/prisma/initPrisma"
import validateMissingFields from "../../utils/validateFields"

export const appointmentService = {
    registerAppointment : async (patientId, data) => {
        validateMissingFields(data,['departmentId','doctorId','slotStart', 'slotEnd'])
    }
}