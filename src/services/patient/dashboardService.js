import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService  = {
    getOverView: async (patientId) => {
        const now = new Date()
        const [nextAppointment,totalAppointments, totalAppointmentsComming, totalAppointmentsSucces] = await Promise.all([
            prisma.appointment.findFirst({
                where : {
                    status : 'PENDING',
                    patientId : Number(patientId),
                    appointmentDate : {
                        gt : now
                    }
                },
                orderBy : {
                    appointmentDate : 'asc'
                }
            }),
            prisma.appointment.count({
                where : {
                    patientId : Number(patientId)
                }
            }),
            prisma.appointment.count({
                where : {
                    status : 'PENDING',
                     patientId : Number(patientId),
                     appointmentDate : {
                        gt : now
                     }
                }
            }),
            prisma.appointment.count({
                where : {
                    patientId : Number(patientId),
                    status : 'COMPLETED'
                }
            })
        ])
        const diffMs = nextAppointment.appointmentDate.getTime() - now.getTime()
        return {
            nextAppointment : diffMs,
            totalAppointments,
            totalAppointmentsComming,
            totalAppointmentsSucces
        }
    },
    getAllAppointments : async (patientId) => {
        const now = new Date

        const appointments = await prisma.appointment.findMany({
            where : {
                status : 'PENDING',
                patientId : Number(patientId),
                appointmentDate : {
                    gt : now
                }
            },
            orderBy : {
                appointmentDate : 'asc'
            },
            select : {
                id : true,
                code : true,
                appointmentDate : true,
                department : {
                    select : {
                        id : true,
                        name : true
                    }
                },
                doctor : {
                    select : {
                        id : true,
                        fullName : true,
                        role : true
                    }
                }
            }
        })
        return {
            appointments
        }
    },
    getHistoryAppointments: async (patientId) => {
        const appointments = await prisma.appointment.findMany({
            where : {
                patientId : Number(patientId),
                status : {
                    in : ['COMPLETED', 'CANCELLED', 'NO_SHOW']
                }
            },
             select : {
                id : true,
                code : true,
                appointmentDate : true,
                department : {
                    select : {
                        id : true,
                        name : true
                    }
                },
                doctor : {
                    select : {
                        id : true,
                        fullName : true,
                        role : true
                    }
                }
            }
        })
        return {
            appointments
        }
    }
}