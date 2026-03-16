import { BadrequestException } from "../../common/helpers/exception.helper"
import prisma from "../../common/prisma/initPrisma"
import validateMissingFields from "../../utils/validateFields"

export const doctorService = {
    getAllDoctorsSimple: async () => {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                isActive: true
            },
            select: {
                id: true,
                fullName: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return {
            doctors
        }
    },
    createDoctorSchedule: async (data) => {
        validateMissingFields(data, ['doctorId','dayOfWeek', 'startTime', 'endTime', 'slotDuration'])
        const {doctorId, dayOfWeek, startTime, endTime, slotDuration} = data

         if (!Number.isInteger(Number(doctorId))) { 
            throw new BadrequestException('doctorId không hợp lệ')
        }
        if (!Number.isInteger(Number(dayOfWeek))) { 
            throw new BadrequestException('Ngày trong tuần không hợp lệ')
        }
        if (!Number.isInteger(Number(startTime))) { 
            throw new BadrequestException('Thời gian bắt đầu không hợp lệ')
        }
        if (!Number.isInteger(Number(endTime))) { 
            throw new BadrequestException('Ngày trong tuần không hợp lệ')
        }
          if (!Number.isInteger(Number(slotDuration))) { 
            throw new BadrequestException('ca khám không hợp lệ')
        }
        if(Number(startTime) >= Number(endTime)) {
             throw new BadrequestException('Thời gian bắt đầu không được lớn hơn thời gian kết thúc')
        }
        if(Number(slotDuration) <10) {
            throw new BadrequestException('Ca khám phải tối thiểu là 10 phút')
        }

        const doctorSchedule = await prisma.doctorSchedule.create({
            data : {
                doctorId : Number(doctorId),
                dayOfWeek : Number(dayOfWeek),
                startTime : Number(startTime),
                endTime : Number(endTime),
                slotDuration : Number(slotDuration)
            }
        })
        return {
            doctorSchedule
        }
    },
    updateDoctorSchedule: async (doctorScheduleId) => {

        const doctorSchedule = await prisma.doctorSchedule.findUnique({
            where : {
                id : Number(doctorScheduleId)
            }
        })
        if(!doctorSchedule) {
            
        }


    }
}