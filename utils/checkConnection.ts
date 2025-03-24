import pb from '@/app/actions/pocketbase';

/**
 * Verifica la conexión con el servidor de PocketBase
 * @returns {Promise<boolean>} true si la conexión es exitosa, false si hay errores
 */
export const checkPocketBaseConnection = async (): Promise<boolean> => {
  try {
    // Intentar hacer una petición básica para verificar la conexión
    const response = await fetch(process.env.NEXT_PUBLIC_POCKETBASE_URL || '', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    
    return true; // Si llega aquí, la conexión fue exitosa
  } catch (error) {
    console.error('Error al verificar la conexión con PocketBase:', error);
    return false;
  }
};

/**
 * Obtiene información de diagnóstico sobre la conexión
 */
export const getConnectionDiagnostics = async (): Promise<Record<string, any>> => {
  const diagnostics: Record<string, any> = {
    pocketbaseUrl: process.env.NEXT_PUBLIC_POCKETBASE_URL,
    isAuthenticated: pb.authStore.isValid,
    userId: pb.authStore.model?.id,
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Verificar conectividad básica
    const connected = await checkPocketBaseConnection();
    diagnostics.connected = connected;
    
    // Si hay conexión, obtener información del servidor
    if (connected) {
      try {
        const health = await pb.health.check();
        diagnostics.serverHealth = health;
      } catch (healthError) {
        diagnostics.serverHealthError = String(healthError);
      }
    }
    
    return diagnostics;
  } catch (error) {
    diagnostics.error = String(error);
    return diagnostics;
  }
}; 