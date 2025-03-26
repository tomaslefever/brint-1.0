'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import pb from '@/app/actions/pocketbase'
import { ArrowDownIcon, ArrowUpIcon, BookDown, BookUp, Box, BoxIcon, CalendarClock, CheckCheckIcon, ClipboardCopy, Download, FileCheck, FileCheck2, FileImageIcon, FilePlus2, FileText, MessageSquarePlus, Package, PercentCircle, User, UserCircle, Users, UserSquare } from 'lucide-react'
import { copyToClipboard } from '@/utils/clipboard'
import { Order } from '@/types/order'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TimeAgo from 'javascript-time-ago'
import es from 'javascript-time-ago/locale/es'
import { createNotification } from '@/utils/notifications'
import { createActivity } from '@/utils/newactivity'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { env } from 'process'
import Link from 'next/link'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { SelectGroup } from '@radix-ui/react-select'
import { CubeIcon } from '@radix-ui/react-icons'

TimeAgo.addLocale(es)
const timeAgo = new TimeAgo('es-ES')

interface EditOrderSheetProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onOrderUpdated: () => void
}

export function EditOrderSheet({ orderId, isOpen, onClose, onOrderUpdated }: EditOrderSheetProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isActivityFocused, setIsActivityFocused] = useState(false)
  const { toast } = useToast()
  const [activity, setActivity] = useState('')
  const [fileDetails, setFileDetails] = useState<Record<string, any>>({});
  const [lightboxUrl, setLightboxUrl] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeGallery, setActiveGallery] = useState<'patient' | 'radiological'>('patient');

  // Separar los slides por tipo
  const patientSlides = order?.expand?.fotografiasPaciente?.map(foto => ({
    src: `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${foto.id}/${foto.attachment}`
  })) || [];

  const radiologicalSlides = order?.expand?.imagenesRadiologicas?.map(foto => ({
    src: `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${foto.id}/${foto.attachment}`
  })) || [];

  // Agregar estado para identificar qué galería está activa

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  // Modificar la función openLightbox
  const openLightbox = (index: number, type: 'patient' | 'radiological') => {
    setActiveGallery(type);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const fetchOrder = async (id: string) => {
    try {
      const userRole = pb.authStore.model?.role;
      const permissionFilter = userRole !== 'admin' 
        ? `created_by = "${pb.authStore.model?.id}"` 
        : '';

      const record = await pb.collection('orders').getOne(id, {
        expand: 'customer,created_by,activity.author,model3d,fotografiasPaciente,fotografiasAdicionales,imagenesRadiologicas,coneBeam',
        filter: permissionFilter
      })
      setOrder(record as unknown as Order)
    } catch (error) {
      console.error('Error al obtener la orden:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la orden",
        variant: "destructive",
      })
    }
  }

  const updateStatus = async (status: string) => {
    await pb.collection('orders').update(orderId!, { status })
    toast({
      title: "Éxito",
      description: "Estado de la orden actualizado correctamente",
    })
    createNotification({
      userId: pb.authStore.model?.id,
      message: `Estado de la orden ${order?.id} actualizado a ${status === 'pending' ? 'Pendiente aceptación archivos' : status === 'working' ? 'En Progreso' : status === 'complete' ? 'Completado' : status === 'canceled' ? 'Cancelado' : status === 'paused' ? 'Pausado' : ''}`,
      type: 'info',
      orderId: orderId!
    });
    onOrderUpdated()
    order!.status = status;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    try {
      await pb.collection('orders').update(orderId!, { status: order.status })
      toast({
        title: "Éxito",
        description: "Estado de la orden actualizado correctamente",
      })
      onOrderUpdated()
      onClose()
    } catch (error) {
      console.error('Error al actualizar el estado de la orden:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    }
  }

  const handleActivitySubmit = async () => {
    setIsActivityFocused(false);

    try {
      if (activity.trim()) {
        await createActivity(orderId!, activity);
        toast({
          title: "Éxito",
          description: "Comentario creado correctamente",
        })
        setActivity('');
        fetchOrder(orderId!);
        createNotification({
          userId: pb.authStore.model?.id,
          message: 'Nueva actividad en la orden ' + orderId,
          type: 'comment',
          orderId: orderId!
        });
      }
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la actividad. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = () => {
    if (order) {
      copyToClipboard(order.id, "ID Copiado", "Se ha copiado el ID de la orden al portapapeles")
    }
  }

  const fetchFileDetails = async (fileId: string) => {
    try {
      const file = await pb.collection('files').getOne(fileId);
      setFileDetails(prev => ({
        ...prev,
        [fileId]: file
      }));
    } catch (error) {
      console.error('Error al obtener detalles del archivo:', error);
    }
  };

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.pointerEvents = 'auto';
    }
    
    return () => {
      if (lightboxOpen) {
        document.body.style.pointerEvents = '';
      }
    };
  }, [lightboxOpen]);

  if (!order) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()} className='pt-10 w-xl sm:max-w-xl overflow-y-auto'>

        <form onSubmit={handleSubmit} className="space-y-2">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 justify-between">
            {/* <div className='flex items-center gap-2'>
            Orden 

            </div> */}
            <Card className='w-full bg-01 text-white bg-bottom hover:bg-top transition-all'>
            <CardHeader>
              <CardTitle>Detalle de la orden</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className='flex flex-col gap-2'>
                <Label className="text-sm font-medium flex items-center gap-1"><FileText className="w-4 h-4" /> ID orden</Label>
                <Badge variant="secondary" className="text-sm font-bold w-fit gap-1">{order.id}</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium flex items-center gap-1"><UserSquare className="w-4 h-4" /> Paciente</Label>
                <Badge variant="secondary" className="text-sm font-bold w-fit gap-1">{order.expand?.customer?.name || 'N/A'} {order.expand?.customer?.lastname || ''}</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium flex items-center gap-1"><UserCircle className="w-4 h-4" /> Creado por</Label>
                <Badge variant="secondary" className="text-sm font-bold w-fit gap-1">{order.expand?.created_by?.name || 'N/A'}</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium flex items-center gap-1"><CalendarClock className="w-4 h-4" /> Fecha de creación</Label>
                <Badge variant="secondary" className="text-sm font-bold w-fit gap-1">{new Date(order.created).toLocaleString()}</Badge>
              </div>
              {order.status && (
                <SelectGroup className='w-full flex flex-col gap-1'>
                  <SelectLabel className='text-sm font-medium flex items-center gap-1 p-0'><PercentCircle className='w-4 h-4' /> Estado</SelectLabel>
                  <Select onValueChange={(value) => updateStatus(value)} value={order.status}>
                    <SelectTrigger className={`w-fit 
                    ${order.status === 'pending' && 'bg-gray-100 text-black'}
                    ${order.status === 'working' && 'bg-blue-600'}
                    ${order.status === 'paused' && 'bg-yellow-600'}
                    ${order.status === 'canceled' && 'bg-red-600'}
                    ${order.status === 'complete' && 'bg-green-600'}
                  `}>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="font-normal text-black bg-yellow-700">Pendiente aceptación archivos</SelectItem>
                    <SelectItem value="working" className="font-normal bg-blue-600 hover:bg-blue-700 text-white">En Progreso</SelectItem>
                    <SelectItem value="paused" className="font-normal bg-yellow-600 hover:bg-yellow-700 text-white">Pausado</SelectItem>
                    <SelectItem value="canceled" className="font-normal bg-red-600 hover:bg-red-700 text-white">Cancelado</SelectItem>
                    <SelectItem value="complete" className="font-normal bg-green-600 hover:bg-green-700 text-white">Completado</SelectItem>
                  </SelectContent>
                </Select>
                </SelectGroup>
              )}
            </CardContent>
            
          </Card>
          </SheetTitle>
        </SheetHeader>
          
        </form>

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
                <AccordionTrigger><span className='flex items-center gap-2'><Package className="w-4 h-4" /> Modelo ({order.expand?.model3d ? 1 : 0})</span></AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-500">Método de entrega del modelo</span>
                      <span className="text-sm capitalize font-bold">{order.metodoEntregaModelo} </span>
                    </div>
                    {order.expand?.model3d && (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-500">Modelo 3D</span>
                        <div className='flex justify-between items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>
                            {order.expand?.model3d?.[0]?.attachment} 
                            <span className='font-bold'>({order.expand?.model3d?.[0]?.attachment.split('.')[0].length} KB)</span>
                          </span>
                          <Link 
                            target="_blank" 
                            href={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${order.expand?.model3d?.[0]?.id}/${order.expand?.model3d?.[0]?.attachment}`} 
                            className="p-2 gap-2 transition-all hover:bg-transparent hover:text-slate-500 border border-gray-300 flex items-center justify-center rounded-md">
                            Descargar <Download className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}
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

              <AccordionItem value="item-7">
                <AccordionTrigger><span className='flex items-center gap-2'><FileImageIcon className="w-4 h-4" /> Imágenes radiológicas ({order.expand?.imagenesRadiologicas?.length ? order.expand?.imagenesRadiologicas?.length : 0})</span></AccordionTrigger>
                <AccordionContent className='grid grid-cols-4 gap-2'>
                  {order.expand?.imagenesRadiologicas?.map((value, index) => (
                    <div key={value.id} className="flex flex-col gap-2">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`} alt={`Imagen radiológica ${value.type}`} 
                        className="object-cover rounded-md aspect-square cursor-pointer"
                        onClick={() => openLightbox(index, 'radiological')}
                      />
                      <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">{value.attachment}</span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

            </Accordion>

        <SheetFooter>
          <div className='flex flex-col gap-2 flex-1'> 
            <div className='flex items-center gap-2'>
              <span className='text-md font-bold text-gray-500'>Actividad</span>
            </div>
            <Textarea 
              placeholder="Escribe un comentario" 
              onFocus={() => setIsActivityFocused(true)}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className='min-h-12'
            />
            {isActivityFocused && (
              <Button type="submit" className='w-fit' onClick={() => handleActivitySubmit()}>Publicar</Button>
            )}
            <div className='space-y-2 flex flex-col flex-col-reverse'>
              {order.expand?.activity?.length > 0 && (
                  order.expand?.activity.map((activity, index) => (
                    <div key={index} className="flex gap-2 p-2 mb-2 hover:bg-gray-200 transition-colors rounded-md dark:hover:bg-gray-800">
                      <Avatar>
                        <AvatarFallback>{activity.expand?.author?.name?.charAt(0)}</AvatarFallback>
                        <AvatarImage src={`http://127.0.0.1:8090/api/files/users/${activity.expand?.author?.id}/${activity.expand?.author?.avatar}`} />
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-bold">{activity.expand?.author?.name} - <HoverCard openDelay={100} closeDelay={100}><HoverCardTrigger className='underline text-muted-foreground font-bold cursor-pointer'>{timeAgo.format(new Date(activity.created))}</HoverCardTrigger><HoverCardContent side="top" className='w-fit backdrop-blur-xl bg-white/10 p-2 rounded-md'>{(new Date(activity.created).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}</HoverCardContent></HoverCard></span>
                        <span className="text-sm">{activity.content}</span>
                      </div>
                    </div>
                  ))
                )}
            </div>            
          </div>
        </SheetFooter>
      </SheetContent>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={activeGallery === 'patient' ? patientSlides : radiologicalSlides}
        index={lightboxIndex}
      />
    </Sheet>
  )
}
