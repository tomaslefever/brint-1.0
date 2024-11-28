import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'comment';

interface CreateNotificationParams {
  userId: string;
  message: string;
  type: NotificationType;
  orderId?: string;
}

export async function createNotification({
  userId,
  message,
  type,
  orderId
}: CreateNotificationParams): Promise<void> {
  try {
    await pb.collection('notifications').create({
      user: userId,
      message,
      type,
      order: orderId,
      read: false,
    });
  } catch (error) {
    console.error('Error al crear la notificación:', error);
    throw error;
  }
}
