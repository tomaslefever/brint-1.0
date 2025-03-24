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
import { BookUser, Box, CircleX, MoreHorizontal, Pencil, Trash } from "lucide-react"
import PocketBase from 'pocketbase'
import { Customer } from '@/types/customer'
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import NewOrder from '../orders/new-order'
import { cn } from "@/lib/utils"
import { EditCustomer } from './edit-customer'
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'

const pb = new PocketBase(process.env.NEXT_PUB)

interface CustomerListProps {
  searchTerm: string;
  refreshTrigger: number;
  onRefreshTriggered: () => void;  // Nueva prop
}

export default function CustomerList({ searchTerm, refreshTrigger, onRefreshTriggered }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const { toast } = useToast()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | null>(null)
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(refreshTrigger);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const currentUser = pb.authStore.model;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCustomers = async () => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const permissionFilter = !isAdmin 
          ? `created_by = "${currentUser?.id}"` 
          : '';

        const searchFilter = searchTerm 
          ? `(name ~ "${searchTerm}" || lastname ~ "${searchTerm}" || rut ~ "${searchTerm}" || email ~ "${searchTerm}")` 
          : '';

        const finalFilter = [permissionFilter, searchFilter]
          .filter(Boolean)
          .join(' && ');

        const records = await pb.collection('customers').getFullList<Customer>({
          filter: finalFilter,
        });
        if (isMounted) {
          setCustomers(records);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching customers:', error);
          setError('No se pudieron cargar los pacientes');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          onRefreshTriggered();
        }
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchTerm, refreshTrigger, onRefreshTriggered]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleDeleteCustomer = async (id: string) => {
    try {
      await pb.collection('customers').delete(id)
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado correctamente",
        variant: "destructive",
        duration: 3000
      })
      // fetchCustomers()
      setConfirmDeleteId(null)
      setOpenDropdownId(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente",
        variant: "destructive",
      })
    }
  }

  const buttonVariants = {
    initial: { opacity: 0, x: -10},
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  const cancelButtonVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  return (
    <>
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
            <TableRow 
              key={customer.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
            >
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.lastname}</TableCell>
              <TableCell>{customer.rut}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu 
                  open={openDropdownId === customer.id} 
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenDropdownId(customer.id ?? null)
                    } else if (!confirmDeleteId) {
                      setOpenDropdownId(null)
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem
                      className='cursor-pointer'
                      onClick={() => {
                        setSelectedCustomerId(customer.id ?? null)
                        setIsSheetOpen(true)
                        setOpenDropdownId(null)
                      }}
                    >
                      <Box className="mr-2 h-4 w-4" /> Nueva orden
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className='cursor-pointer'
                      onSelect={(event) => {
                        event.preventDefault()
                        setSelectedCustomerForEdit(customer)
                        setIsEditSheetOpen(true)
                        setOpenDropdownId(null)
                      }}
                    >
                      <BookUser className="mr-2 h-4 w-4" />Ficha paciente
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AnimatePresence mode="wait">
                      {confirmDeleteId === customer.id ? (
                        <motion.div
                          key="confirm"
                          variants={buttonVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <DropdownMenuItem 
                            className="bg-red-600 text-white cursor-pointer hover:bg-red-700"
                            onClick={() => customer.id && handleDeleteCustomer(customer.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Confirmar
                          </DropdownMenuItem>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="delete"
                          variants={buttonVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer w-40"
                            onClick={() => setConfirmDeleteId(customer.id ?? null)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Eliminar paciente
                          </DropdownMenuItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {confirmDeleteId === customer.id && (
                        <motion.div
                          variants={cancelButtonVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <DropdownMenuItem 
                            className="text-gray-600 cursor-pointer w-40"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            <CircleX className="mr-2 h-4 w-4" /> Cancelar
                          </DropdownMenuItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-xl sm:max-w-xl">
          {selectedCustomerId && (
            <NewOrder
              customer_id={selectedCustomerId}
              onOrderCreated={() => setLocalRefreshTrigger(prev => prev + 1)}
            />
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-xl sm:max-w-xl overflow-y-auto">
          {selectedCustomerForEdit && (
            <EditCustomer 
              customer={selectedCustomerForEdit} 
              onSave={() => {
                setIsEditSheetOpen(false)
                // fetchCustomers()
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

