import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'comment';

interface CreateNotificationParams {
  userId: string;
  message: string;
  type: NotificationType;
  orderId?: string;
}

export async function createNotification({
  userId = '',
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
