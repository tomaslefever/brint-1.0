'use client'

import { Card } from '@/components/ui/card'
import NewOrder from '../new-order'

export default function NewOrderPage() {
  return (
    <Card>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Orden</h1>
      <NewOrder 
        onOrderCreated={() => {
          // Manejar la redirección después de crear la orden
          window.location.href = '/dashboard/orders'
        }}
      />
    </div>
    </Card>
  )
}