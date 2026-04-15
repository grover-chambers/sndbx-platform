// This is a simple in-memory notification broadcaster
// For production, consider using Redis or a message queue

type NotificationHandler = (notification: any) => void

class NotificationService {
  private handlers: Map<string, Set<NotificationHandler>> = new Map()

  subscribe(userId: string, handler: NotificationHandler) {
    if (!this.handlers.has(userId)) {
      this.handlers.set(userId, new Set())
    }
    this.handlers.get(userId)!.add(handler)
    
    return () => {
      this.handlers.get(userId)?.delete(handler)
    }
  }

  async sendNotification(userId: string, notification: {
    title: string
    message: string
    type: string
    data?: any
  }) {
    // Store in database
    const { prisma } = await import("@/lib/prisma")
    await prisma.notification.create({
      data: {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userId: userId,
        isRead: false
      }
    })
    
    // Send to connected clients
    const handlers = this.handlers.get(userId)
    if (handlers) {
      handlers.forEach(handler => handler(notification))
    }
  }
}

export const notificationService = new NotificationService()
