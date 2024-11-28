'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline, TimelineItem } from './timeline'
import { OrderCard } from './order-card'
import { ProposalCard } from './proposal-card'
import pb from '@/app/actions/pocketbase'
import { useToast } from '@/hooks/use-toast'
import { Order } from '@/types/order'
import { Notification } from '@/types/notification'
import { Button } from '@/components/ui/button'
import { Proposal } from '@/types/proposal'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TimelineEvent {
  id: string
  date: Date
  type: 'order' | 'notification' | 'proposal'
  title: string
  description: string
  orderId?: string
  order?: Order
  notification?: Notification
  proposal?: Proposal
}

async function fetchOrderDetails(id: string): Promise<Order | null> {
  try {
    const record = await pb.collection('orders').getOne(id, {
      expand: 'customer,created_by,activity.author,model3d,fotografiasPaciente,fotografiasAdicionales,imagenesRadiologicas',
      requestKey: null
    });

    return record as unknown as Order;
  } catch (error) {
    console.error('Error al obtener los detalles de la orden:', error)
    return null
  }
}

async function fetchOrderTimeline(orderId: string): Promise<TimelineEvent[]> {
  try {
    // Obtener la orden
    const order = await pb.collection('orders').getOne(orderId, {
      expand: 'customer,created_by,activity.author,model3d,fotografiasPaciente,fotografiasAdicionales,imagenesRadiologicas',
    });

    // Obtener propuestas relacionadas con la orden
    const proposals = await pb.collection('proposals').getFullList({
      filter: `order = "${orderId}"`,
      expand: 'order,created_by',
      sort: '-created'
    });

    const timeline: TimelineEvent[] = [
      {
        id: order.id,
        date: new Date(order.created),
        type: 'order' as const,
        title: `Orden #${order.id}`,
        description: order.description || 'Sin descripción',
        orderId: order.id,
        order: order as unknown as Order
      },
      ...proposals.map(proposal => ({
        id: proposal.id,
        date: new Date(proposal.created),
        type: 'proposal' as const,
        title: `Propuesta de Tratamiento`,
        description: proposal.detallesTratamiento || 'Sin detalles',
        orderId: proposal.order,
        proposal: proposal as unknown as Proposal
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  } catch (error) {
    console.error('Error al obtener el historial de la orden:', error)
    return []
  }
}

export default function OrderDetailScreen({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderData = await fetchOrderDetails(params.id)
        if (orderData) {
          setOrder(orderData)
          const timelineData = await fetchOrderTimeline(params.id)
          setTimeline(timelineData)
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la orden",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [params.id])

  return (
    <div className='flex flex-col gap-4 justify-end'>
      <div className="flex gap-6">
        <Card className="w-1/3 h-64">
          <CardHeader>
            <CardTitle>Información de la orden</CardTitle>
          </CardHeader>
          <CardContent>
            {order && order.expand && (
              <div className="space-y-4">
                <p><strong>Paciente:</strong> {order.expand.customer.name}</p>
                <p><strong>Doctor:</strong> {order.expand.created_by.name}</p>
                <p><strong>Estado:</strong> {order.status === 'pending' ? 'Pendiente' : order.status === 'working' ? 'En Progreso' : order.status === 'complete' ? 'Completado' : order.status === 'canceled' ? 'Cancelado' : order.status === 'paused' ? 'Pausado' : order.status === 'proposal_sent' ? 'Propuesta enviada': ''}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => router.push(`/dashboard/orders/${params.id}/new-proposal`)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Propuesta
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-2/3">
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[800px] overflow-y-auto">
            <Timeline>
              {timeline.map((event) => (
                <TimelineItem
                  key={event.id}
                  date={event.date}
                  title={event.title}
                  type={event.type}

                >
                  {event.type === 'order' && event.order ? (
                    <OrderCard order={event.order} />
                  ) : (
                    <p>{event.description}</p>
                  )}
                  {event.type === 'proposal' && event.proposal ? (
                    <ProposalCard proposal={event.proposal} />
                  ) : null}
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 