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
TimeAgo.addLocale(es)
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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const currentUser = pb.authStore.model;
  const isAdmin = currentUser?.role === 'admin';

  const router = useRouter();

  // Agregar estados para el ordenamiento
  const [sortField, setSortField] = useState<'created' | 'updated'>('created')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

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
        
        const sortString = sortField === 'created' 
          ? `${sortDirection === 'desc' ? '-' : '+'}created`
          : `${sortDirection === 'desc' ? '-' : '+'}updated`;

        // Obtener el total de registros
        const totalResult = await pb.collection('orders').getList(1, 1, {
          filter: finalFilter,
          sort: sortString,
        });

        const total = totalResult.totalItems;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));

        // Obtener los registros de la página actual
        const records = await pb.collection('orders').getList(currentPage, itemsPerPage, {
          sort: sortString,
          filter: finalFilter,
          expand: 'customer,created_by,activity',
          requestKey: null
        });

        if (isMounted) {
          setOrders(records.items as unknown as Order[])
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

    const orderIdFromUrl = searchParams.get('order_id')
    if (orderIdFromUrl) {
      setEditingOrderId(orderIdFromUrl)
    }

    return () => {
      isMounted = false
      pb.cancelAllRequests()
    }
  }, [searchTerm, refreshTrigger, searchParams, sortField, sortDirection, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

      // Refetch orders after deletion with pagination
      const permissionFilter = !isAdmin 
        ? `created_by = "${currentUser?.id}"` 
        : '';
      const searchFilter = searchTerm 
        ? `(name ~ "${searchTerm}" || address ~ "${searchTerm}")` 
        : '';
      const finalFilter = [permissionFilter, searchFilter]
        .filter(Boolean)
        .join(' && ');

      const sortString = sortField === 'created' 
        ? `${sortDirection === 'desc' ? '-' : '+'}created`
        : `${sortDirection === 'desc' ? '-' : '+'}updated`;

      // Obtener el total de registros actualizado
      const totalResult = await pb.collection('orders').getList(1, 1, {
        filter: finalFilter,
        sort: sortString,
      });

      const total = totalResult.totalItems;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));

      // Si la página actual es mayor que el total de páginas, ajustar a la última página
      if (currentPage > Math.ceil(total / itemsPerPage)) {
        setCurrentPage(Math.ceil(total / itemsPerPage));
      }

      // Obtener los registros de la página actual
      const records = await pb.collection('orders').getList(currentPage, itemsPerPage, {
        sort: sortString,
        filter: finalFilter,
        expand: 'customer,created_by,activity',
        requestKey: null
      });

      setOrders(records.items as unknown as Order[]);
      setConfirmDeleteId(null);
      setOpenDropdownId(null);
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

  const handleSort = (field: 'created' | 'updated') => {
    if (sortField === field) {
      // Si es el mismo campo, cambiar la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Si es un campo diferente, establecerlo como desc por defecto
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <>
      {isLoading && <p>Cargando órdenes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                  {/* <TableHead>ID</TableHead> */}
                  <TableHead>Paciente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead 
                    onClick={() => handleSort('created')}
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    Fecha creación {sortField === 'created' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead 
                    onClick={() => handleSort('updated')}
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    Última modificación {sortField === 'updated' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className='cursor-pointer relative'
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0 flex gap-2 items-center justify-start"
                    >
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
                    </motion.td>
                    
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      <Badge variant={
                          order.status === 'pending' ? 'warning' :
                          order.status === 'working' ? 'success' :
                          order.status === 'complete' ? 'info' :
                          order.status === 'canceled' ? 'destructive' :
                          order.status === 'paused' ? 'warning' :
                          order.status === 'proposal_sent' ? 'success' :
                          order.status === 'proposal_pending' ? 'warning' :
                          order.status === 'proposal_accepted' ? 'success' :
                          order.status === 'proposal_rejected' ? 'destructive' :
                          order.status === 'order_approved' ? 'warning' :
                          order.status === 'meeting_scheduled' ? 'warning' :
                          order.status === 'shipping' ? 'info' :
                          'default'
                        }>
                            {
                            order.status === 'pending' ? 'Pendiente aceptación archivos' :
                            order.status === 'canceled' ? 'Cancelado' :
                            order.status === 'paused' ? 'Pausado' :
                            order.status === 'proposal_pending' ? 'En espera de propuesta de Innovaligners' :
                            order.status === 'proposal_sent' ? 'Propuesta enviada' :
                            order.status === 'proposal_accepted' ? 'Solicitud alineadores' :
                            order.status === 'proposal_rejected' ? 'Propuesta rechazada' :
                            order.status === 'order_approved' ? 'Archivos aceptados' :
                            order.status === 'working' ? 'Alineadores en producción' :
                            order.status === 'shipping' ? 'Despachado' :
                            order.status === 'complete' ? 'Trabajo completado' :
                            order.status === 'meeting_scheduled' ? 'Reunión virtual agendada' :
                            'default'
                        }
                      </Badge>
                    </motion.td>
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {format(new Date(order.created), 'dd/MM/yyyy')}
                    </motion.td>
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {order.expand?.created_by?.name || 'N/A'}
                    </motion.td>
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {order.updated 
                        ? timeAgo.format(new Date(order.updated))
                        : 'N/A'}
                    </motion.td>
                    <motion.td
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
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
                          {/* <DropdownMenuItem 
                            className='cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOrderId(order.id);
                            }}
                          >
                            <Box className="mr-2 h-4 w-4" />Ver orden
                          </DropdownMenuItem> */}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (order.id) {
                                      handleDeleteOrder(order.id);
                                    }
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(order.id);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                >
                                  <CircleX className="mr-2 h-4 w-4" /> Cancelar
                                </DropdownMenuItem>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.td>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          {/* Paginación */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {totalItems} órdenes en total
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
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
