'use client'

import { useState, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import OrderList from './order-list'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import NewOrder from './new-order'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Link from 'next/link'

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const formContentRef = useRef('')

  const handleSheetOpenChange = (open: boolean) => {
    if (!open && formContentRef.current) {
      setShowConfirmDialog(true)
    } else {
      setIsSheetOpen(open)
    }
  }

  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    setIsSheetOpen(false)
    formContentRef.current = ''
  }

  return (
    <Card>
      <CardHeader>
      <CardTitle className='text-2xl'>Órdenes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Link href="/dashboard/orders/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Orden
              </Button>
            </Link>
          </div>
          <OrderList searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
        </div>
      </CardContent>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Hay contenido sin guardar en el formulario. ¿Estás seguro de que quieres cerrar y descartar la información?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmClose}>Cerrar y descartar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
