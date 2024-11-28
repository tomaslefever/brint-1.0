'use client'

import { useState, useEffect } from 'react'
import { Customer } from '@/types/customer'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import PocketBase from 'pocketbase'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

const pb = new PocketBase('http://127.0.0.1:8090')

interface EditCustomerProps {
  customer: Customer
  onSave: () => void
}

export function EditCustomer({ customer, onSave }: EditCustomerProps) {
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer)
  const [orders, setOrders] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [customer.id])

  const fetchOrders = async () => {
    try {
      if (customer.orders && customer.orders.length > 0) {
        const records = await pb.collection('orders').getList(1, 200, {
          filter: `customer ?= "${customer.id}"`,
          sort: '-created',
          requestKey: null,
        })
        setOrders(records.items)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error al obtener órdenes:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes del paciente",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedCustomer(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pb.collection('customers').update(customer.id ?? '', editedCustomer)
      toast({
        title: "Éxito",
        description: "Paciente actualizado correctamente",
      })
      onSave()
    } catch (error) {
      console.error('Error updating customer:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ficha Paciente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
          <div>
            <Label className='text-xs text-muted-foreground'>Nombres</Label>
            <Input name="name" value={editedCustomer.name ?? ''} onChange={handleInputChange} placeholder="Nombre" />
          </div>
          <div>
            <Label className='text-xs text-muted-foreground'>Apellidos</Label>
            <Input name="lastname" value={editedCustomer.lastname ?? ''} onChange={handleInputChange} placeholder="Apellidos" />
          </div>
          <div>
            <Label className='text-xs text-muted-foreground'>RUT</Label>
            <Input name="rut" value={editedCustomer.rut ?? ''} onChange={handleInputChange} placeholder="RUT" />
          </div>
          <div>
            <Label className='text-xs text-muted-foreground'>Email</Label>
            <Input name="email" value={editedCustomer.email ?? ''} onChange={handleInputChange} placeholder="Email" />
          </div>
          <div>
            <Label className='text-xs text-muted-foreground'>Teléfono</Label>
            <Input name="phone" value={editedCustomer.phone ?? ''} onChange={handleInputChange} placeholder="Teléfono" />
          </div>
        </div>
        <Button type="submit" className='w-full'>Guardar cambios</Button>
      </form>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Órdenes del paciente</h3>
        {orders.length > 0 ? (
          <ul className="space-y-2 text-md">
            {orders.map(order => (
              <li key={order.id} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <div className='text-xs font-bold'>ID: {order.id}</div>
                  <div className="text-sm text-gray-500">Fecha: {new Date(order.created).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{order.comments}</div>
                </div>
                <Link href={`/dashboard/orders/?order_id=${order.id}`}><Button size={'sm'} variant={'outline'} className='bg-secondary'>Ver orden</Button></Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Este paciente no tiene órdenes.</p>
        )}
      </div>
    </div>
  )
}
