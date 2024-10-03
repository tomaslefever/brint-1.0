'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import PocketBase from 'pocketbase'
import { Customer } from '@/types/customer'
import { useToast } from "@/hooks/use-toast"

const pb = new PocketBase('http://127.0.0.1:8090')

interface CustomerListProps {
  searchTerm: string;
  refreshTrigger: number;
}

export default function CustomerList({ searchTerm, refreshTrigger }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      const records = await pb.collection('customers').getFullList<Customer>({
        sort: '-created',
        filter: searchTerm ? `name ~ "${searchTerm}" || lastname ~ "${searchTerm}" || rut ~ "${searchTerm}" || email ~ "${searchTerm}"` : '',
      });
      setCustomers(records)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, refreshTrigger])

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente?')) {
      try {
        await pb.collection('customers').delete(id)
        toast({
          title: "Éxito",
          description: "Paciente eliminado correctamente",
        })
        fetchCustomers() // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el paciente",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellido</TableHead>
          <TableHead>RUT</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.lastname}</TableCell>
            <TableCell>{customer.rut}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                  <DropdownMenuItem>Editar paciente</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => customer.id && handleDeleteCustomer(customer.id)}
                  >
                    Eliminar paciente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}