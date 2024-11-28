'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import pb from '@/app/actions/pocketbase'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProposalCard } from '@/components/dashboard/proposal-card'
import { Proposal } from '@/types/proposal'

interface NewProposalProps {
  orderId: string;
  onProposalCreated?: () => void;
}

export default function NewProposal({ orderId, onProposalCreated }: NewProposalProps) {
  const [paso, setPaso] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Estados para el formulario - nombres actualizados según la interfaz
  const [details, setDetails] = useState('')
  const [duration, setDuration] = useState('')
  const [aligners_count, setAlignersCount] = useState('')
  const [price, setPrice] = useState('')
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState('pending')

  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="details">Detalles del Tratamiento</Label>
        <Textarea 
          id="details"
          placeholder="Describe los detalles del tratamiento propuesto"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duración Estimada</Label>
          <Input 
            id="duration"
            placeholder="ej: 6 meses"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aligners_count">Cantidad de Alineadores</Label>
          <Input 
            id="aligners_count"
            type="number"
            placeholder="ej: 12"
            value={aligners_count}
            onChange={(e) => setAlignersCount(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comments">Observaciones Adicionales</Label>
        <Textarea 
          id="comments"
          placeholder="Ingrese cualquier observación adicional"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>
    </div>
  )

  const renderPaso2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="price">Precio del Tratamiento</Label>
        <Input 
          id="price"
          type="number"
          placeholder="Ingrese el precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado de la Propuesta</Label>
        <select
          id="status"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>
    </div>
  )

  const handleCreateProposal = async () => {
    if (!details || !duration || !aligners_count || !price) {
      setError('Por favor, complete todos los campos requeridos.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const proposalData = {
        order: orderId,
        details,
        duration,
        aligners_count,
        price,
        comments,
        created_by: pb.authStore.model?.id,
        status: 'pending',
        created: new Date().toISOString(),
      }

      const createdProposal = await pb.collection('proposals').create(proposalData)

      // Actualizar el estado de la orden
      await pb.collection('orders').update(orderId, {
        status: 'proposal_sent',
        proposal: createdProposal.id
      })

      if (onProposalCreated) {
        onProposalCreated()
      }
    } catch (error) {
      console.error('Error al crear la propuesta:', error)
      setError('Hubo un error al crear la propuesta. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="w-full space-y-4">
          <div className="flex flex-col">
            <div className='text-xs text-muted-foreground'>
              Paso {paso} de 2 - {
                paso === 1 ? "Detalles del tratamiento" : "Información comercial"
              }
            </div>
          </div>
          
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
            {paso === 1 ? renderPaso1() : renderPaso2()}
          </div>

          <div className="flex justify-between px-1">
            {paso > 1 && (
              <Button variant="outline" onClick={() => setPaso(paso - 1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
            )}
            {paso < 2 ? (
              <Button 
                onClick={() => setPaso(paso + 1)} 
                className="ml-auto"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                className="ml-auto" 
                onClick={handleCreateProposal} 
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Propuesta'}
              </Button>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 