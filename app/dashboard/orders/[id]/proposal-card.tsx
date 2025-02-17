import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FileCheck2, Clock, DollarSign, MessageSquare, Check, X, Box, Truck, Images, Video } from "lucide-react"
import { Proposal } from "@/types/proposal"
import { Button } from "@/components/ui/button"
import { pb } from "@/lib/pocketbase"
import { toast } from "@/hooks/use-toast"
import { createNotification } from "@/utils/notifications"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface ProposalCardProps {
  proposal: Proposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const router = useRouter()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const comparisonSlides = proposal.expand?.comparisons?.map(fileId => ({
    src: `${process.env.NEXT_PUBLIC_BASE_FILE_URL}${fileId.id}/${fileId.attachment}`
  })) || []

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const updateStatus = async (status: string) => {
    await pb.collection('proposals').update(proposal.id!, { status })
    await pb.collection('orders').update(proposal.order as unknown as string, { status })
    toast({
      title: "Éxito",
      description: "Estado de la propuesta actualizado correctamente",
    })
    createNotification({
      userId: status == 'proposal_accepted' || status == 'working' || status == 'shipping' || status == 'complete' ? proposal.order.expand?.created_by.id : '',
      message: `Estado de la propuesta ${proposal.order} actualizado a ${
        status === 'pending' ? 'Pendiente' : 
        status === 'proposal_accepted' ? 'Aceptada' : 
        status === 'proposal_rejected' ? 'Rechazada' : 
        status === 'working' ? 'Piezas en fabricación' : 
        status === 'shipping' ? 'Piezas enviadas' : 
        status === 'complete' ? 'Trabajo completado' : status
      }`,
      type: 'info',
      orderId: proposal.order as unknown as string
    })
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="">
        <Accordion type="single" collapsible className="w-full pt-2 pb-4">
          <AccordionItem value="detalles">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <FileCheck2 className="w-4 h-4" /> Detalles del Tratamiento
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm">{proposal.details}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="comparaciones">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <Images className="w-4 h-4" /> Comparaciones ({proposal.expand?.comparisons?.length || 0})
              </span>
            </AccordionTrigger>
            <AccordionContent className='grid grid-cols-2 gap-2'>
              {proposal.expand?.comparisons?.map((value, index) => (
                <div className="flex flex-col gap-2">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`}
                    alt={`Comparación ${index + 1}`}
                    className="object-cover rounded-md cursor-pointer"
                    onClick={() => openLightbox(index)}
                  />
                  <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">
                    Comparación {Math.floor(index/2) + 1} {index % 2 === 0 ? '(Antes)' : '(Después)'}
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="videos">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <Video className="w-4 h-4" /> Videos ({proposal.expand?.videos?.length || 0})
              </span>
            </AccordionTrigger>
            <AccordionContent className='grid grid-cols-1 gap-4'>
              {proposal.expand?.videos?.map((video, index) => (
                <div key={video.id} className="flex flex-col gap-2">
                  <video 
                    controls
                    className="w-full rounded-md"
                    src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${video.id}/${video.attachment}`}
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                  <span className="text-sm font-medium text-gray-500">
                    Video {index + 1}
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="duracion">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <Clock className="w-4 h-4" /> Plan, Duración y Alineadores
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Plan de Tratamiento</span>
                  <span className="text-lg">{
                    proposal.treatment_plan === 'light_single' ? 'Light 1 Maxilar' :
                    proposal.treatment_plan === 'light_double' ? 'Light 2 Maxilares' :
                    proposal.treatment_plan === 'medium_single' ? 'Medio 1 Maxilar' :
                    proposal.treatment_plan === 'medium_double' ? 'Medio 2 Maxilares' :
                    proposal.treatment_plan === 'full_single' ? 'Full 1 Maxilar' :
                    'Full 2 Maxilares'
                  }</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Duración Estimada</span>
                  <span className="text-lg">{proposal.duration}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Maxilar Superior</span>
                  <span className="text-lg">{proposal.upper_aligners_count} alineadores</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Mandíbula</span>
                  <span className="text-lg">{proposal.lower_aligners_count} alineadores</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="precio">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <DollarSign className="w-4 h-4" /> Precio
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Precio del Tratamiento</span>
                <span className="text-lg">${Number(proposal.price).toLocaleString('es-CL')}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {proposal.comments && (
            <AccordionItem value="comentarios">
              <AccordionTrigger>
                <span className='flex items-center gap-2'>
                  <MessageSquare className="w-4 h-4" /> Observaciones Adicionales
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">{proposal.comments}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      {proposal.status == 'pending' && pb.authStore.model?.role == 'doctor' && (
        <CardFooter className="flex gap-2">
          <Button className="gap-2 bg-green-700" onClick={() => updateStatus('proposal_accepted')}><Check className="w-4"></Check>Aceptar plan de tratamiento</Button>
          <Button className="gap-2 bg-red-700" onClick={() => updateStatus('proposal_rejected')}><X className="w-4"></X>Rechazar plan de tratamiento</Button>
        </CardFooter>
      )}
      {proposal.status == 'proposal_accepted' && pb.authStore.model?.role == 'admin' && (
        <CardFooter className="flex gap-2">
          <Button className="gap-2 bg-green-700" onClick={() => updateStatus('working')}><Box className="w-4"></Box>Piezas en fabricación</Button>
        </CardFooter>
      )}
      {proposal.status == 'working' && pb.authStore.model?.role == 'admin' && (
        <CardFooter className="flex gap-2">
          <Button className="gap-2 bg-green-700" onClick={() => updateStatus('shipping')}><Truck className="w-4"></Truck>Piezas enviadas</Button>
        </CardFooter>
      )}
      {proposal.status == 'shipping' && pb.authStore.model?.role == 'doctor' && (
        <CardFooter className="flex gap-2">
          <Button className="gap-2 bg-green-700" onClick={() => updateStatus('complete')}><Check className="w-4"></Check>Piezas recibidas</Button>
        </CardFooter>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={comparisonSlides}
        index={lightboxIndex}
      />
    </Card>
  )
} 