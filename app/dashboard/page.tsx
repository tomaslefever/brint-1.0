'use client'

import { useState, useEffect, Suspense } from 'react'
import { Bell, LayoutDashboard, ShoppingBag, FileText, Users, Settings, ChevronRight, UserCheck, Box } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import {parse} from 'date-fns/parse'
import {startOfWeek} from 'date-fns/startOfWeek'
import {getDay} from 'date-fns/getDay'
import "react-big-calendar/lib/css/react-big-calendar.css"
import { format, subDays, subHours } from 'date-fns'
import pb from '@/app/actions/pocketbase'
import { Order } from '@/types/order'
import TimeAgo from 'javascript-time-ago'
import es from 'javascript-time-ago/locale/es'
import { EditOrderSheet } from './orders/edit-order-sheet'
import { useRouter } from 'next/navigation'
import OrderList from './orders/order-list'

TimeAgo.addLocale(es)
const timeAgo = new TimeAgo('es-ES')

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})


export default function Dashboard() {
  const router = useRouter();

  const [activeUsers, setActiveUsers] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [recentCustomers, setRecentCustomers] = useState(0)
  const [newNotifications, setNewNotifications] = useState(3)
  const [pedidosRecientes, setPedidosRecientes] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  const archivosRecientes = [
    { id: 1, nombre: "BracketV2.stl", tiempoSubida: "Subido hace 2 horas" },
    { id: 2, nombre: "Placa3D.stl", tiempoSubida: "Subido hace 4 horas" },
    { id: 3, nombre: "Engranaje_v1.stl", tiempoSubida: "Subido hace 1 día" },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Verificar si el usuario es admin
        const currentUser = pb.authStore.model
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
          // Usuarios activos en las últimas 24 horas
          const activeUsersResult = await pb.collection('users').getList(1, 1, {
            // filter: `last_login >= "${format(subHours(new Date(), 24), "yyyy-MM-dd HH:mm:ss")}"`,
            requestKey: null
          });
          setActiveUsers(activeUsersResult.totalItems);
        } else {
          setActiveUsers(0); // O puedes ocultar completamente esta sección para no-admins
        }

        // Órdenes pendientes
        const userFilter = currentUser?.role === 'admin' || currentUser?.role === 'manager'
          ? ''
          : `created_by = "${currentUser?.id}"`;

        const pendingOrdersResult = await pb.collection('orders').getList(1, 1, {
          filter: userFilter,
          requestKey: null
        });
        setPendingOrders(pendingOrdersResult.totalItems);

        // Pacientes ingresados en los últimos 7 días
        const recentCustomersResult = await pb.collection('customers').getList(1, 1, {
          // filter: `created >= "${format(subDays(new Date(), 7), "yyyy-MM-dd HH:mm:ss")}"`,
          requestKey: null
        });
        setRecentCustomers(recentCustomersResult.totalItems);

        // Obtener las últimas 5 órdenes
        const recentOrdersResult = await pb.collection('orders').getList(1, 5, {
          sort: '-created',
          filter: userFilter,
          expand: 'created_by',
          requestKey: null
        });
        setPedidosRecientes(recentOrdersResult.items as any);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsEditSheetOpen(true)
  }

  const handleCloseEditSheet = () => {
    setIsEditSheetOpen(false)
    setSelectedOrderId(null)
  }

  const handleOrderUpdated = () => {
    // Actualizar la lista de pedidos recientes
    // fetchDashboardData()
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {activeUsers > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos (24h)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Usuarios activos en las últimas 24 horas</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Órdenes pendientes de procesamiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Pacientes (7 días)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCustomers}</div>
            <p className="text-xs text-muted-foreground">Pacientes ingresados en los últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
            <CardDescription>Últimas 5 órdenes ingresadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando órdenes...</div>}>
              <OrderList 
                searchTerm=""
                refreshTrigger={0}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Archivos Recientes</CardTitle>
            <CardDescription>Últimos archivos de modelos 3D subidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {archivosRecientes.map((archivo) => (
                <div key={archivo.id} className="flex items-center">
                  <FileText className="w-9 h-9 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-medium">{archivo.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{archivo.tiempoSubida}</p>
                  </div>
                  <Button variant="outline" size="sm">Ver</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle>Calendario de Escaneos</CardTitle>
          <CardDescription>Próximos escaneos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={escaneosProgramados}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día"
              }}
              culture='es'
            />
          </div>
        </CardContent>
      </Card> */}
      <EditOrderSheet
        orderId={selectedOrderId}
        isOpen={isEditSheetOpen}
        onClose={handleCloseEditSheet}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  )
}
