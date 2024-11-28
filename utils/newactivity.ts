import pb from '@/app/actions/pocketbase'
import { createNotification } from '@/utils/notifications'

export const createActivity = async (orderId: string, content: string) => {
  try {
    const newActivity = await pb.collection('activities').create({
      order: orderId,
      content: content,
      author: pb.authStore.model?.id,
    });
    
    const updatedOrder = await pb.collection('orders').getOne(orderId);
    const updatedActivities = [...(updatedOrder.activity || []), newActivity.id];
    
    await pb.collection('orders').update(orderId, { activity: updatedActivities });

    return newActivity;
  } catch (error) {
    console.error('Error al crear la actividad:', error);
    throw error;
  }
};
