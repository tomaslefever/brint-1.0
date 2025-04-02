'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import pb from '@/app/actions/pocketbase'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from "@/components/ui/badge"
import { Proposal } from '@/types/proposal'

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const records = await pb.collection('proposals').getFullList({
          sort: '-created',
          expand: 'order.customer,videos'
        })
        setProposals(records as unknown as Proposal[])
      } catch (error) {
        console.error('Error al cargar las propuestas:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las propuestas",
          variant: "destructive",
        })
      }
    }

    fetchProposals()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    const statusText = {
      pending: 'Pendiente aceptación archivos',
      accepted: 'Aceptada',
      rejected: 'Rechazada'
    }
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {statusText[status as keyof typeof statusText]}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Propuestas de Tratamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:bg-slate-50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        Paciente: {proposal.expand?.order?.expand?.customer?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Creada el {format(new Date(proposal.created), "PPP", { locale: es })}
                      </p>
                      <p className="mt-2">{proposal.details}</p>
                      <div className="mt-2 space-x-4">
                        <span className="text-sm">
                          Duración: {proposal.duration}
                        </span>
                        <span className="text-sm">
                          Alineadores Superior: {proposal.upper_aligners_count}
                        </span>
                        <span className="text-sm">
                          Alineadores Inferior: {proposal.lower_aligners_count}
                        </span>
                        <span className="text-sm font-semibold">
                          Precio: ${proposal.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 