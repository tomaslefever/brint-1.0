'use client'

import NewProposal from '../../../proposals/new-proposal'
import { useRouter } from 'next/navigation'

export default function NewProposalPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <NewProposal 
      orderId={params.id}
      onProposalCreated={() => {
        router.push(`/dashboard/orders/${params.id}`)
      }}
    />
  )
} 