import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const notificationService = {
    getAllNofications: async (patientId) => {
        const [notifications, notificationsUnRead] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    userId: patientId
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    isRead: true
                }
            }),
            prisma.notification.count({
                where: {
                    userId: patientId,
                    isRead: false
                }
            })
        ])
        return {
            notifications,
            notificationsUnRead
        }
    },
    getInfoNotification: async (patientId,notificationId) => {
        
        const notification = await prisma.notification.findUnique({
            where : {
                 id : Number(notificationId),
                userId : patientId
            }
        })
        if(!notification) {
            throw new NotFoundException('Không tìm thấy thông báo này')
        }
        if(!notification.isRead) {
            await prisma.notification.update({
                where : {
                    id : Number(notificationId),
                    userId : patientId
                },
                data : {
                    isRead : true
                }
            })
        }
        return {
            notification
        }
    }
}