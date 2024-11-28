'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { MoreHorizontal, Pencil, Trash, Eye, Box, CircleX, X, Trash2 } from "lucide-react"
import { RecordModel } from 'pocketbase'
import { useToast } from "@/hooks/use-toast"
import pb from '@/app/actions/pocketbase'
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
// import { es } from 'date-fns/locale'
import { EditOrderSheet } from './edit-order-sheet'
import { Order } from '@/types/order'
import { motion, AnimatePresence } from 'framer-motion'
import TimeAgo from 'javascript-time-ago'
import es from 'javascript-time-ago/locale/es'
import { useRouter } from 'next/navigation'

// Configurar TimeAgo (esto debería estar en un archivo de configuración global)
TimeAgo.addDefaultLocale(es)
const timeAgo = new TimeAgo('es-ES')

interface OrderListProps {
  searchTerm: string;
  refreshTrigger: number;
}

export default function OrderList({ searchTerm, refreshTrigger }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const { toast } = useToast()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const currentUser = pb.authStore.model;
  const isAdmin = currentUser?.role === 'admin';

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const requestKey = `fetchOrders_${Date.now()}`;
        const permissionFilter = !isAdmin 
          ? `created_by = "${currentUser?.id}"` 
          : '';
        const searchFilter = searchTerm 
          ? `(name ~ "${searchTerm}" || address ~ "${searchTerm}")` 
          : '';
        const finalFilter = [permissionFilter, searchFilter]
          .filter(Boolean)
          .join(' && ');
        const records = await pb.collection('orders').getFullList<Order>({
          sort: '-created',
          filter: finalFilter,
          expand: 'customer,created_by,activity',
          requestKey: requestKey
        });
        if (isMounted) {
          setOrders(records as Order[])
        }
      } catch (error) {
        if (isMounted && error instanceof Error && error.name !== 'ClientResponseError') {
          console.error('Error al cargar las órdenes:', error)
          setError('No se pudieron cargar las órdenes')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchOrders()

    // Verificar si hay un order_id en la URL
    const orderIdFromUrl = searchParams.get('order_id')
    if (orderIdFromUrl) {
      setEditingOrderId(orderIdFromUrl)
    }

    return () => {
      isMounted = false
      pb.cancelAllRequests()
    }
  }, [searchTerm, refreshTrigger, searchParams])

  const handleDeleteOrder = async (id: string) => {
    try {
      const requestKey = `deleteOrder_${id}_${Date.now()}`;
      await pb.collection('orders').delete(id, { requestKey });
      toast({
        title: "Orden eliminada",
        description: "La orden ha sido eliminada correctamente",
        variant: "destructive",
        duration: 3000
      })
      // Refetch orders after deletion
      const fetchRequestKey = `refetchAfterDelete_${Date.now()}`;
      const records = await pb.collection('orders').getFullList<Order>({
        sort: '-created',
        filter: searchTerm ? `name ~ "${searchTerm}" || address ~ "${searchTerm}"` : '',
        expand: 'customer,created_by,activity.created',
        requestKey: fetchRequestKey
      });
      setOrders(records as Order[])
      setConfirmDeleteId(null)
      setOpenDropdownId(null)
    } catch (error) {
      console.error('Error al eliminar la orden:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    // ... (código existente)
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
      {isLoading && <p>Cargando órdenes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
                {/* <TableHead>ID</TableHead> */}
                <TableHead>Paciente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha creación</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id} className='cursor-pointer'
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              >
                {/* <TableCell>
                  <Badge 
                    className='bg-slate-500 font-mono cursor-pointer hover:bg-slate-600 transition-colors'
                    onClick={() => setEditingOrderId(order.id)}
                  >
                    {order.id}
                  </Badge>
                </TableCell> */}
                <TableCell className='flex gap-2 items-center justify-start'>
                  {order.expand?.fotografiasPaciente?.map((value, index) => (
                    <div key={value.id} className="flex flex-col gap-2">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BASE_FILE_URL}${value.id}/${value.attachment}`} 
                        alt={`Foto ${value.type}`} 
                        className="object-cover rounded-md aspect-square cursor-pointer" 
                      />
                      <span className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap">{value.attachment}</span>
                    </div>
                  ))}
                  {order.expand?.customer?.name || 'N/A'} {order.expand?.customer?.lastname || ''}
                </TableCell>
                  
                <TableCell>
                  <Badge variant={
                      order.status === 'pending' ? 'outline' :
                      order.status === 'working' ? 'info' :
                      order.status === 'complete' ? 'success' :
                      order.status === 'canceled' ? 'destructive' :
                      order.status === 'paused' ? 'warning' :
                      order.status === 'proposal_sent' ? 'success' :
                      'default'
                    }>
                        {
                        order.status === 'pending' ? 'Pendiente' :
                        order.status === 'working' ? 'En Progreso' :
                        order.status === 'complete' ? 'Completado' :
                        order.status === 'canceled' ? 'Cancelado' :
                        order.status === 'paused' ? 'Pausado' :
                        order.status === 'proposal_sent' ? 'Propuesta enviada' :
                        ''
                    }
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(order.created), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{order.expand?.created_by?.name || 'N/A'}</TableCell>
                <TableCell>
                  {order.expand?.activity && order.expand.activity.length > 0
                    ? timeAgo.format(new Date(order.expand.activity[order.expand.activity.length - 1].created))
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu 
                    open={openDropdownId === order.id} 
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenDropdownId(order.id)
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
                        onClick={() => setEditingOrderId(order.id)}
                      >
                        <Box className="mr-2 h-4 w-4" />Ver orden
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AnimatePresence mode="wait">
                        {confirmDeleteId === order.id ? (
                          <motion.div
                            key="confirm"
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <DropdownMenuItem 
                              className="bg-red-600 focus:bg-red-700 hover:text-white focus:text-white text-white cursor-pointer hover:bg-red-700 w-36"
                              onClick={() => order.id && handleDeleteOrder(order.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Confirmar
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
                              className="text-red-600 cursor-pointer w-36"
                              onClick={() => setConfirmDeleteId(order.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Eliminar orden
                            </DropdownMenuItem>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {confirmDeleteId === order.id && (
                          <motion.div
                            variants={cancelButtonVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <DropdownMenuItem 
                              className="text-gray-600 cursor-pointer"
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
      )}
      <EditOrderSheet 
        orderId={editingOrderId}
        isOpen={!!editingOrderId}
        onClose={() => {
          setEditingOrderId(null)
          // Eliminar el parámetro order_id de la URL
          const url = new URL(window.location.href)
          url.searchParams.delete('order_id')
          window.history.replaceState({}, '', url)
        }}
        onOrderUpdated={() => {
          const userRole = pb.authStore.model?.role;
          const permissionFilter = userRole !== 'admin' 
            ? `created_by = "${pb.authStore.model?.id}"` 
            : '';
          const refetchRequestKey = `refetchAfterEdit_${Date.now()}`;
          pb.collection('orders').getFullList<Order>({
            sort: '-created',
            filter: permissionFilter,
            expand: 'customer,created_by,activity.created',
            requestKey: refetchRequestKey
          }).then(records => setOrders(records as Order[]));
        }}
      />
    </>
  )
}
