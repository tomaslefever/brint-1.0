'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, UserSquare, UserCircle, PercentCircle, CalendarClock, Check, X, Calendar, Loader2 } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FileCheck2, Package, FileImageIcon } from "lucide-react"
import Link from "next/link"
import { Download } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Order } from "@/types/order"
import { pb } from "@/lib/pocketbase"
import { toast } from "@/hooks/use-toast"
import { createNotification } from "@/utils/notifications"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import NewProposal from "@/app/dashboard/proposals/new-proposal"

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import router from "next/router"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {

      // Separar los slides por tipo
  const patientSlides = order?.expand?.fotografiasPaciente?.map(foto => ({
    src: `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${foto.id}/${foto.attachment}`
  })) || [];

  const radiologicalSlides = order?.expand?.imagenesRadiologicas?.map(foto => ({
    src: `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${foto.id}/${foto.attachment}`
  })) || [];

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [activeGallery, setActiveGallery] = useState<'patient' | 'radiological'>('patient');

    const [compressionStatus, setCompressionStatus] = useState<{
      status: 'idle' | 'compressing' | 'completed' | 'error';
      progress: number;
      error?: string;
    }>({ status: 'idle', progress: 0 });

    console.log(order);

    const openLightbox = (index: number, type: 'patient' | 'radiological') => {
        setActiveGallery(type);
        setLightboxIndex(index);
        setLightboxOpen(true);
      };
const updateStatus = async (status: string) => {
    await pb.collection('orders').update(order.id!, { status })
    toast({
        title: "Éxito",
        description: "Estado de la orden actualizado correctamente",
    })
    createNotification({
        userId: status == 'order_approved' || status == 'working' || status == 'shipping' || status == 'complete' || status == 'proposal_sent' ? order.expand?.created_by.id : '',
        message: `Estado de la orden ${order?.id} actualizado a ${
          status === 'pending' ? 'Pendiente aceptación archivos' : 
          status === 'working' ? 'Alineadores en producción' : 
          status === 'shipping' ? 'Alineadores enviados' :
          status === 'complete' ? 'Trabajo completado' : 
          status === 'canceled' ? 'Cancelado' : 
          status === 'paused' ? 'Pausado' : 
          status === 'proposal_sent' ? 'Propuesta enviada': 
          status === 'proposal_accepted' ? 'Solicitud alineadores': 
          status === 'order_approved' ? 'Archivos aceptados': 
          status === 'order_rejected' ? 'Archivos con inconsistencias': 
          status === 'meeting_scheduled' ? 'Reunión virtual agendada': 
          status === 'meeting_completed' ? 'En espera de propuesta de Innovaligners': ''}`,
        type: 'info',
        orderId: order.id!
    });
    // onOrderUpdated()
    order!.status = status;
    // router.reload();
}

const handleCompressAndDownload = async () => {
  try {
    setCompressionStatus({ status: 'compressing', progress: 0 });
    
    // Iniciar el proceso de compresión
    const response = await fetch(`/api/orders/${order.id}/conebeam`);
    
    // Verificar si la respuesta es JSON (jobId) o un archivo ZIP
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const { jobId } = await response.json();

      // Verificar el estado cada segundo
      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/orders/${order.id}/conebeam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });
        
        const status = await statusResponse.json();
        
        if (status.status === 'completed') {
          setCompressionStatus({ status: 'completed', progress: 100 });
          // Descargar el archivo
          window.location.href = `/api/orders/${order.id}/conebeam`;
          return;
        } else if (status.status === 'error') {
          setCompressionStatus({ 
            status: 'error', 
            progress: 0, 
            error: status.error 
          });
          return;
        } else {
          setCompressionStatus({ 
            status: 'compressing', 
            progress: status.progress 
          });
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
    } else if (contentType?.includes('application/zip')) {
      // Si es un archivo ZIP, descargarlo directamente
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}-conebeam.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setCompressionStatus({ status: 'completed', progress: 100 });
      setTimeout(() => setCompressionStatus({ status: 'idle', progress: 0 }), 2000);
    }
  } catch (error) {
    console.error(error);
    setCompressionStatus({ 
      status: 'error', 
      progress: 0, 
      error: 'Error al iniciar la compresión' 
    });
  }
};

  return (
      <Card>
            <CardContent className="">



            <Accordion type="single" collapsible className="w-full pt-2 pb-4">
              <AccordionItem value="item-3">
                <AccordionTrigger><span className='flex items-center gap-2'><FileCheck2 className="w-4 h-4" /> Maxilar Superior</span></AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(order.maxilarSuperior).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">{key}</span>
                        <span className="text-lg">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger><span className='flex items-center gap-2'><FileCheck2 className="w-4 h-4" /> Mandíbula</span></AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(order.mandibula).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">{key}</span>
                        <span className="text-lg">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger><span className='flex items-center gap-2'><Package className="w-4 h-4" /> Modelo ({order.expand?.model3d?.length || 0})</span></AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-500">Método de entrega del modelo</span>
                      <span className="text-sm capitalize font-bold">{order.metodoEntregaModelo} </span>
                    </div>
                    {order.expand?.model3d && order.expand.model3d.map((model, index) => (
                      <div key={model.id} className="flex flex-col">
                        <span className="font-medium text-gray-500">Modelo 3D {index + 1}</span>
                        <div className='flex justify-between items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>{model.attachment} <span className='font-bold'>({model.attachment.split('.')[0].length} KB)</span></span>
                          <Link target="_blank" href={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${model.id}/${model.attachment}`} className="p-2 gap-2 transition-all hover:bg-transparent hover:text-slate-500 border border-gray-300 flex items-center justify-center rounded-md ">Descargar <Download className="h-3 w-3" /></Link>
                        </div>
                      </div>
                    ))}
                    {order.metodoEntregaModelo == 'fisico' && (
                      <Card className='w-full '>
                        <CardHeader className='px-4 pb-2'>
                            <CardTitle>Información de retiro</CardTitle>
                        </CardHeader>
                        <CardContent className='px-4'>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-500">Dirección de retiro</span>
                            <span className="text-sm capitalize">{order.direccionRetiro}, {order.comunaRetiro}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarClock className="w-4 h-4" />
                            {new Date(order.fechaRetiro).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                              })} a las {order.horaRetiro}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger><span className='flex items-center gap-2'><FileImageIcon className="w-4 h-4" /> Fotografías paciente ({order.expand?.fotografiasPaciente?.length ? order.expand?.fotografiasPaciente?.length : 0})</span></AccordionTrigger>
                <AccordionContent className='grid grid-cols-4 gap-2'>
                {order.expand?.fotografiasPaciente?.map((value, index) => (
                  <div key={value.id} className="flex flex-col gap-2">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`} 
                      alt={`Foto ${value.type}`} 
                      className="object-cover rounded-md aspect-square cursor-pointer" 
                      onClick={() => openLightbox(index, 'patient')}
                    />
                    <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">{value.attachment}</span>
                  </div>
                ))}
                </AccordionContent>
              </AccordionItem>

              {order.expand?.imagenesRadiologicas?.length && (
              <AccordionItem value="item-7">
                <AccordionTrigger><span className='flex items-center gap-2'><FileImageIcon className="w-4 h-4" /> Imágenes radiológicas ({order.expand?.imagenesRadiologicas?.length ? order.expand?.imagenesRadiologicas?.length : 0})</span></AccordionTrigger>
                <AccordionContent className='grid grid-cols-4 gap-2'>
                  {order.expand?.imagenesRadiologicas?.map((value, index) => {
                    const isZipFile = value.attachment.toLowerCase().endsWith('.zip');

                    return isZipFile ? (
                      <div key={value.id} className="flex flex-col gap-2">
                        <Link 
                          href={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`}
                          target="_blank"
                          className="p-4 border rounded-md hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">Descargar ZIP (Cone Beam)</span>
                        </Link>
                        <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">{value.attachment}</span>
                      </div>
                    ) : (
                      <div key={value.id} className="flex flex-col gap-2">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`}
                          alt={`Imagen radiológica ${value.type}`} 
                          className="object-cover rounded-md aspect-square cursor-pointer"
                          onClick={() => openLightbox(index, 'radiological')}
                        />
                        <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">{value.attachment}</span>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
                )}


              {order.expand?.coneBeam?.length && (
              <AccordionItem value="item-7">
                <AccordionTrigger><span className='flex items-center gap-2'><FileImageIcon className="w-4 h-4" /> Cone Beam ({order.expand?.coneBeam?.length} archivos)</span></AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">{order.expand?.coneBeam?.length} archivos disponibles</span>
                      </div>
                      <Button 
                        onClick={handleCompressAndDownload}
                        disabled={compressionStatus.status === 'compressing'}
                        className="flex items-center gap-2"
                      >
                        {compressionStatus.status === 'compressing' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Descargando ({compressionStatus.progress}%)</span>
                          </>
                        ) : compressionStatus.status === 'error' ? (
                          <>
                            <X className="h-4 w-4" />
                            <span className="text-sm font-medium">Error</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span className="text-sm font-medium">Descargar todos</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {compressionStatus.error && (
                      <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                        {compressionStatus.error}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              )}

            </Accordion>
            </CardContent>
            {pb.authStore.model?.role == 'admin' && order.status == 'pending' && (
            <CardFooter className="flex gap-2">
              <Button className="bg-green-700 gap-2" onClick={() => updateStatus('order_approved')}><Check className="w-4"></Check>Aceptar archivos</Button>
              <Button className="gap-2 bg-red-700" onClick={() => updateStatus('order_rejected')}><X className="w-4"></X> Archivos con inconsistencias</Button>
            </CardFooter>
            )}
            {order.status == 'meeting_scheduled' && pb.authStore.model?.role == 'admin' && (
              <CardFooter className="flex gap-2">
                <Link href={`/dashboard/orders/${order.id}/new-proposal`}><Button>Crear plan de tratamiento</Button></Link>
              </CardFooter>
            )}
            {order.status == 'meeting_completed' && pb.authStore.model?.role == 'admin' && (
              <CardFooter className="flex gap-2">
                <Link href={`/dashboard/orders/${order.id}/new-proposal`}><Button>Crear plan de tratamiento</Button></Link>
              </CardFooter>
            )}
            {order.status == 'order_approved' && pb.authStore.model?.role == 'doctor' && (
              <CardFooter className="flex gap-2">
                <Button className="gap-2" onClick={() => {updateStatus('meeting_scheduled'); window.open('https://calendly.com/innovaligners', '_blank');}}><Calendar className="w-4 h-4"></Calendar> Agendar reunión</Button>
                <Button className="gap-2" onClick={() => {updateStatus('meeting_completed')}}><Calendar className="w-4 h-4"></Calendar> Esperar propuesta de Innovaligners</Button>
              </CardFooter>
            )}
            <Lightbox
            open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={activeGallery === 'patient' ? patientSlides : radiologicalSlides}
                index={lightboxIndex}
            />

          </Card>
  )
} 