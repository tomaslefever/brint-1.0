import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FileCheck2, Clock, DollarSign, MessageSquare } from "lucide-react"
import { Proposal } from "@/types/proposal"

interface ProposalCardProps {
  proposal: Proposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
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

          <AccordionItem value="duracion">
            <AccordionTrigger>
              <span className='flex items-center gap-2'>
                <Clock className="w-4 h-4" /> Duración y Alineadores
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Duración Estimada</span>
                  <span className="text-lg">{proposal.duration}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">Cantidad de Alineadores</span>
                  <span className="text-lg">{proposal.aligners_count}</span>
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
    </Card>
  )
} 