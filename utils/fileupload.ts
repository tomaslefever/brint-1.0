import pb from '@/app/actions/pocketbase'
// import { createNotification } from '@/utils/notifications'

export const uploadFile = async (file: File, orderId: string, type: string) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('order', orderId);
    formData.append('type', type);
    formData.append('owner', pb.authStore.model?.id || '');

    const newFile = await pb.collection('files').create(formData, {
      $cancelKey: `upload_${orderId}_${Date.now()}`,
      requestKey: `upload_${orderId}_${Date.now()}`,
    });
    
    const updatedOrder = await pb.collection('orders').getOne(orderId);
    
    const fieldMap: { [key: string]: keyof typeof updatedOrder } = {
      'model3d': 'model3d',
      'fotografiasPaciente': 'fotografiasPaciente',
      'fotografiasAdicionales': 'fotografiasAdicionales',
      'imagenesRadiologicas': 'imagenesRadiologicas',
      'comparisons': 'comparisons'
    };

    const field = fieldMap[type];
    if (!field) {
      throw new Error('Tipo de archivo no válido');
    }

    const currentFiles = Array.isArray(updatedOrder[field]) ? updatedOrder[field] : [];
    
    const updateData = {
      [field]: [...currentFiles, newFile.id]
    };
    
    await pb.collection('orders').update(orderId, updateData);

    return newFile;
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    if (error.isAbort) {
      console.log('La solicitud fue cancelada');
    }
    throw error;
  }
};
