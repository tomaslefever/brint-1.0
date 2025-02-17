import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, Clock, Package } from "lucide-react"
import { Proposal } from "@/types/proposal"

interface ProposalCardProps {
  proposal: Proposal;
  isExpanded?: boolean;
}

export function ProposalCard({ proposal, isExpanded = false }: ProposalCardProps) {
  const getTreatmentPlanLabel = (plan: string) => {
    switch(plan) {
      case 'light_single': return 'Light 1 Maxilar';
      case 'light_double': return 'Light 2 Maxilares';
      case 'medium_single': return 'Medio 1 Maxilar';
      case 'medium_double': return 'Medio 2 Maxilares';
      case 'full_single': return 'Full 1 Maxilar';
      case 'full_double': return 'Full 2 Maxilares';
      default: return plan;
    }
  }

  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg cursor-pointer">
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Propuesta de Tratamiento</p>
            <p className="text-sm text-muted-foreground">
              {getTreatmentPlanLabel(proposal.treatment_plan)} - ${Number(proposal.price).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant={
          proposal.status === 'pending' ? 'warning' : 
          proposal.status === 'accepted' ? 'success' : 
          'destructive'
        }>
          {proposal.status === 'pending' ? 'Pendiente' : 
           proposal.status === 'accepted' ? 'Aceptada' : 
           'Rechazada'}
        </Badge>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Propuesta de Tratamiento
        </CardTitle>
        <Badge variant={
          proposal.status === 'pending' ? 'warning' : 
          proposal.status === 'accepted' ? 'success' : 
          'destructive'
        }>
          {proposal.status === 'pending' ? 'Pendiente' : 
           proposal.status === 'accepted' ? 'Aceptada' : 
           'Rechazada'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Plan y Duración</p>
              <p className="text-sm text-muted-foreground">
                {getTreatmentPlanLabel(proposal.treatment_plan)} - {proposal.duration}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Alineadores</p>
              <p className="text-sm text-muted-foreground">
                Superior: {proposal.upper_aligners_count} / Inferior: {proposal.lower_aligners_count}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Detalles del Tratamiento</p>
          </div>
          <p className="text-sm text-muted-foreground">{proposal.details}</p>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Precio: ${Number(proposal.price).toLocaleString()}</p>
        </div>

        {proposal.comments && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Observaciones</p>
            <p className="text-sm text-muted-foreground">{proposal.comments}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 