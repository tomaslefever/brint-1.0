'use client'

import { useState } from 'react'
import { CalendarIcon, ChevronDown, MoreHorizontal, ArrowUpDown, Search, Download, Filter, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from 'next/link'

const ordenes = [
    {
        id: '1',
        paciente: 'Juan Pérez',
        fechaCreacion: new Date(2023, 5, 15),
        estado: 'Pendiente de pago',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_3d.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia.jpg', tipo: 'Radiografía' },
            { nombre: 'foto_frontal.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '2',
        paciente: 'María González',
        fechaCreacion: new Date(2023, 5, 20),
        estado: 'Pendiente',
        tipo: 'Alineador parcial',
        archivos: [
            { nombre: 'modelo_3d_parcial.stl', tipo: 'Modelo 3D' },
            { nombre: 'foto_lateral.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '3',
        paciente: 'Carlos Rodríguez',
        fechaCreacion: new Date(2023, 5, 25),
        estado: 'Completado',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_final.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_final.jpg', tipo: 'Radiografía' },
            { nombre: 'foto_frontal_final.jpg', tipo: 'Fotografía' },
            { nombre: 'foto_lateral_final.jpg', tipo: 'Fotografía' },
        ]
    },
    // Nuevas órdenes
    {
        id: '4',
        paciente: 'Lucía Martínez',
        fechaCreacion: new Date(2023, 6, 1),
        estado: 'Completado',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_lucia.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_lucia.jpg', tipo: 'Radiografía' },
        ]
    },
    {
        id: '5',
        paciente: 'Fernando Torres',
        fechaCreacion: new Date(2023, 6, 5),
        estado: 'En proceso',
        tipo: 'Alineador parcial',
        archivos: [
            { nombre: 'modelo_fer.stl', tipo: 'Modelo 3D' },
            { nombre: 'foto_fer.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '6',
        paciente: 'Sofía López',
        fechaCreacion: new Date(2023, 6, 10),
        estado: 'Pendiente',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_sofia.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_sofia.jpg', tipo: 'Radiografía' },
        ]
    },
    {
        id: '7',
        paciente: 'Diego Ramírez',
        fechaCreacion: new Date(2023, 6, 15),
        estado: 'Completado',
        tipo: 'Alineador parcial',
        archivos: [
            { nombre: 'modelo_diego.stl', tipo: 'Modelo 3D' },
            { nombre: 'foto_diego.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '8',
        paciente: 'Valentina Ruiz',
        fechaCreacion: new Date(2023, 6, 20),
        estado: 'En proceso',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_vale.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_vale.jpg', tipo: 'Radiografía' },
        ]
    },
    {
        id: '9',
        paciente: 'Andrés Morales',
        fechaCreacion: new Date(2023, 6, 25),
        estado: 'Pendiente',
        tipo: 'Alineador parcial',
        archivos: [
            { nombre: 'modelo_andres.stl', tipo: 'Modelo 3D' },
            { nombre: 'foto_andres.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '10',
        paciente: 'Camila Jiménez',
        fechaCreacion: new Date(2023, 7, 1),
        estado: 'Completado',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_cami.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_cami.jpg', tipo: 'Radiografía' },
        ]
    },
    {
        id: '11',
        paciente: 'Sebastián Gómez',
        fechaCreacion: new Date(2023, 7, 5),
        estado: 'En proceso',
        tipo: 'Alineador parcial',
        archivos: [
            { nombre: 'modelo_sebastian.stl', tipo: 'Modelo 3D' },
            { nombre: 'foto_sebastian.jpg', tipo: 'Fotografía' },
        ]
    },
    {
        id: '12',
        paciente: 'Isabella Soto',
        fechaCreacion: new Date(2023, 7, 10),
        estado: 'Pendiente',
        tipo: 'Alineador completo',
        archivos: [
            { nombre: 'modelo_isabella.stl', tipo: 'Modelo 3D' },
            { nombre: 'radiografia_isabella.jpg', tipo: 'Radiografía' },
        ]
    },
]

export default function Ordenes() {
    const [selectedOrder, setSelectedOrder] = useState<typeof ordenes[0] | null>(null)
    const [date, setDate] = useState<Date>()
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredOrders = ordenes.filter(orden =>
        orden.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.estado.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOrderClick = (orden: typeof ordenes[0]) => {
        setSelectedOrder(orden)
        setIsModalOpen(true)
    }

    const handleDownload = (fileName: string) => {
        // Aquí iría la lógica para descargar el archivo
        console.log(`Descargando archivo: ${fileName}`)
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'en proceso':
                return 'bg-yellow-500'
            case 'pendiente':
                return 'bg-blue-500'
            case 'completado':
                return 'bg-green-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes</CardTitle>
                    <CardDescription>Gestiona y visualiza todas las órdenes de alineadores</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="Buscar órdenes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-[300px]"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filtros
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Fecha</h4>
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Link href="/dashboard/new-order">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear nueva orden
                            </Button>
                        </Link>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>
                                    <Button variant="ghost" className="p-0 hover:bg-transparent">
                                        Paciente
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" className="p-0 hover:bg-transparent">
                                        Fecha de creación
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((orden) => (
                                <TableRow key={orden.id} className="cursor-pointer" onClick={() => handleOrderClick(orden)}>
                                    <TableCell>{orden.id}</TableCell>
                                    <TableCell>{orden.paciente}</TableCell>
                                    <TableCell>{format(orden.fechaCreacion, "dd/MM/yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(orden.estado)} text-white`}>{orden.estado}</Badge>
                                    </TableCell>
                                    <TableCell>{orden.tipo}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOrderClick(orden); }}>Ver detalles</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Editar orden</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Descargar archivos</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de la orden</DialogTitle>
                        <DialogDescription>Orden #{selectedOrder?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="mt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Paciente</p>
                                    <p>{selectedOrder.paciente}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                                    <p>{format(selectedOrder.fechaCreacion, "PPP", { locale: es })}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Estado</p>
                                    <p>{selectedOrder.estado}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                                    <p>{selectedOrder.tipo}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Archivos asociados</h3>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    {selectedOrder.archivos.map((archivo, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <div>
                                                <p className="font-medium">{archivo.nombre}</p>
                                                <p className="text-sm text-gray-500">{archivo.tipo}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(archivo.nombre)}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button className="w-full">Ver orden completa</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}