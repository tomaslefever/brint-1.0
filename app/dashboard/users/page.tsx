'use client'

import { useState } from 'react'
import { Bell, Home, Package, Users, Settings, FileText, Plus, Search, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Carlos Pérez', email: 'carlos.perez@example.com', orders: 12, status: 'Activo' },
    { id: '2', name: 'María López', email: 'maria.lopez@example.com', orders: 8, status: 'Activo' },
    { id: '3', name: 'Juan García', email: 'juan.garcia@example.com', orders: 5, status: 'Inactivo' },
    { id: '4', name: 'Ana Martínez', email: 'ana.martinez@example.com', orders: 15, status: 'Activo' },
    { id: '5', name: 'Luis Fernández', email: 'luis.fernandez@example.com', orders: 3, status: 'Activo' },
  ])

  return (

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search customers" className="pl-8" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new customer here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Customer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit customer</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete customer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  )
}