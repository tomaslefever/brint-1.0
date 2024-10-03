'use client'

import { useState } from 'react'
import { Bell, LayoutDashboard, ShoppingBag, FileText, Users, Settings, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import es from 'date-fns/locale/es'
import "react-big-calendar/lib/css/react-big-calendar.css"


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
  const [newNotifications, setNewNotifications] = useState(3)

  const escaneosProgramados = [
    {
      id: 1,
      title: 'María González',
      start: new Date(2024, 9, 27, 9, 0),
      end: new Date(2024, 9, 27, 10, 0),
    },
    {
      id: 2,
      title: 'Juan Pérez',
      start: new Date(2024, 9, 27, 10, 30),
      end: new Date(2024, 9, 27, 11, 30),
    },
    {
      id: 3,
      title: 'Ana Rodríguez',
      start: new Date(2024, 9, 27, 12, 0),
      end: new Date(2024, 9, 27, 13, 0),
    },
    {
      id: 4,
      title: 'Carlos Sánchez',
      start: new Date(2024, 9, 27, 9, 30),
      end: new Date(2024, 9, 27, 10, 30),
    },
    {
      id: 5,
      title: 'Laura Martínez',
      start: new Date(2024, 9, 27, 11, 0),
      end: new Date(2024, 9, 27, 12, 0),
    },
  ]

  const pedidosRecientes = [
    { id: 1234, nombre: "Bracket Personalizado", progreso: 80 },
    { id: 1235, nombre: "Placa de Montaje", progreso: 60 },
    { id: 1236, nombre: "Juego de Engranajes", progreso: 30 },
  ]

  const archivosRecientes = [
    { id: 1, nombre: "BracketV2.stl", tiempoSubida: "Subido hace 2 horas" },
    { id: 2, nombre: "Placa3D.stl", tiempoSubida: "Subido hace 4 horas" },
    { id: 3, nombre: "Engranaje_v1.stl", tiempoSubida: "Subido hace 1 día" },
  ]

  return (


        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Escaneos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{escaneosProgramados.length}</div>
                <p className="text-xs text-muted-foreground">Escaneos programados para los próximos días</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivos Activos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">6 archivos pendientes de revisión</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>Tienes 3 pedidos en progreso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pedidosRecientes.map((pedido) => (
                    <div key={pedido.id} className="flex items-center">
                      <div className="w-9 h-9 rounded bg-gray-200 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{pedido.nombre}</h3>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Pedido #{pedido.id}</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 ml-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pedido.progreso}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
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
            </Card>
          </div>

          <Card>
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
          </Card>
        </div>
  )
}