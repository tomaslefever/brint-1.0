import pb from '@/app/actions/pocketbase'
// import { createNotification } from '@/utils/notifications'

export const uploadFile = async (file: File, orderId: string, type: string) => {
  try {
    const newFile = await pb.collection('files').create({
        attachment: file,
        order: orderId,
        type: type,
        owner: pb.authStore.model?.id,
    });
    
    const updatedOrder = await pb.collection('orders').getOne(orderId);
    
    // Determinar el campo correcto según el tipo
    const fieldMap: { [key: string]: keyof typeof updatedOrder } = {
      'model3d': 'model3d',
      'fotografiasPaciente': 'fotografiasPaciente',
      'fotografiasAdicionales': 'fotografiasAdicionales',
      'imagenesRadiologicas': 'imagenesRadiologicas'
    };

    const field = fieldMap[type];
    if (!field) {
      throw new Error('Tipo de archivo no válido');
    }

    const updateData = {
      [field]: [...(updatedOrder[field] || []), newFile.id]
    };
    
    await pb.collection('orders').update(orderId, updateData);

    return newFile;
  } catch (error) {
    console.error('Error al crear la actividad:', error);
    throw error;
  }
};
