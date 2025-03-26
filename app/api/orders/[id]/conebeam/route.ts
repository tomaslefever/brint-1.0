import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

// Almacenar el estado de los procesos de compresión
const compressionJobs = new Map<string, {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}>();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const zipFileName = `${orderId}-conebeam.zip`;
    const zipPath = path.join(process.cwd(), 'tmp', zipFileName);

    // Verificar si el archivo zip ya existe y no tiene más de 24 horas
    try {
      await access(zipPath);
      const stats = fs.statSync(zipPath);
      const fileAge = Date.now() - stats.mtimeMs;
      
      if (fileAge < 24 * 60 * 60 * 1000) { // menos de 24 horas
        // Leer el archivo existente
        const zipBuffer = await readFile(zipPath);
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${zipFileName}`,
          },
        });
      }
    } catch (error) {
      // El archivo no existe o tiene más de 24 horas, continuamos con la creación
    }

    // Obtener la orden y sus archivos
    const order = await pb.collection('orders').getOne(orderId, {
      expand: 'coneBeam',
    });

    if (!order.expand?.coneBeam?.length) {
      return new NextResponse('No hay archivos para comprimir', { status: 404 });
    }

    // Comprobar si el nombre del archivo ya existe en el servidor
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    // Asegurarse de que el directorio tmp existe
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    
    // Verificar si el archivo zip ya existe
    const zipFileExists = fs.existsSync(zipPath);
    
    if (zipFileExists) {
      console.log(`El archivo ${zipFileName} ya existe en el servidor`);
      
      // Verificar la antigüedad del archivo
      const stats = fs.statSync(zipPath);
      const fileAge = Date.now() - stats.mtimeMs;
      
      // Si el archivo tiene menos de 24 horas, lo devolvemos directamente
      if (fileAge < 24 * 60 * 60 * 1000) {
        console.log(`El archivo ${zipFileName} tiene menos de 24 horas, se devuelve el existente`);
        const zipBuffer = await readFile(zipPath);
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${zipFileName}`,
          },
        });
      } else {
        console.log(`El archivo ${zipFileName} tiene más de 24 horas, se generará uno nuevo`);
        // Eliminar el archivo antiguo
        await unlink(zipPath);
      }
    } else {
      console.log(`El archivo ${zipFileName} no existe en el servidor, se creará uno nuevo`);
    }

    // Generar un ID único para este proceso
    const jobId = `${orderId}-${Date.now()}`;
    
    // Iniciar el proceso en segundo plano
    compressionJobs.set(jobId, { status: 'pending', progress: 0 });
    
    // Procesar en segundo plano
    processCompression(orderId, jobId, order.expand.coneBeam, zipPath).catch(error => {
      compressionJobs.set(jobId, { 
        status: 'error', 
        progress: 0, 
        error: error.message 
      });
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('Error al iniciar la compresión:', error);
    return new NextResponse('Error al iniciar la compresión', { status: 500 });
  }
}

async function processCompression(orderId: string, jobId: string, files: any[], zipPath: string) {
  try {
    compressionJobs.set(jobId, { status: 'processing', progress: 0 });
    
    // Crear un nuevo archivo zip
    const zip = new JSZip();
    const totalFiles = files.length;

    // Descargar y agregar cada archivo al zip
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileUrl = `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${file.id}/${file.attachment}`;
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      zip.file(file.attachment, arrayBuffer);
      
      // Actualizar progreso
      const progress = Math.round(((i + 1) / totalFiles) * 100);
      compressionJobs.set(jobId, { status: 'processing', progress });
    }

    // Generar el archivo zip
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Asegurarse de que el directorio tmp existe
    if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'tmp'));
    }

    // Guardar el archivo zip
    await writeFile(zipPath, zipBuffer);

    // Marcar como completado
    compressionJobs.set(jobId, { status: 'completed', progress: 100 });

    // Programar la eliminación del archivo después de 24 horas
    setTimeout(async () => {
      try {
        await unlink(zipPath);
      } catch (error) {
        console.error('Error al eliminar el archivo zip:', error);
      }
    }, 24 * 60 * 60 * 1000);

  } catch (error) {
    console.error('Error en el proceso de compresión:', error);
    compressionJobs.set(jobId, { 
      status: 'error', 
      progress: 0, 
      error: error.message 
    });
    throw error;
  }
}

// Endpoint para verificar el estado de la compresión
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { jobId } = await request.json();
    const job = compressionJobs.get(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error al verificar el estado:', error);
    return NextResponse.json({ error: 'Error al verificar el estado' }, { status: 500 });
  }
} 