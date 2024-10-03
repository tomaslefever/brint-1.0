'use client'

import { useState } from 'react'
import { Bell, Home, Package, Users, Settings, FileText, Plus, Search, MoreHorizontal, Upload, Eye, Download, Trash2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FilesScreen() {
  const [files, setFiles] = useState([
    { id: '1', name: 'BracketV2.stl', type: 'STL', size: '2.5 MB', uploadDate: '2023-09-15', status: 'Approved', order: 'ORD-001' },
    { id: '2', name: 'GearAssembly.obj', type: 'OBJ', size: '5.1 MB', uploadDate: '2023-09-14', status: 'Pending', order: 'ORD-002' },
    { id: '3', name: 'CustomPart.stl', type: 'STL', size: '1.8 MB', uploadDate: '2023-09-13', status: 'Approved', order: 'ORD-003' },
    { id: '4', name: 'PrototypeCasing.3mf', type: '3MF', size: '3.7 MB', uploadDate: '2023-09-12', status: 'Rejected', order: 'ORD-004' },
    { id: '5', name: 'MechanicalParts.step', type: 'STEP', size: '7.2 MB', uploadDate: '2023-09-11', status: 'Approved', order: 'ORD-005' },
  ])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<string>('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleFileUpload = () => {
    if (selectedFile && selectedOrder) {
      // Here you would typically handle the file upload to your backend
      console.log('Uploading file:', selectedFile.name, 'for order:', selectedOrder)
      // After successful upload, you might want to add the file to the list
      setFiles(prevFiles => [
        ...prevFiles,
        {
          id: (prevFiles.length + 1).toString(),
          name: selectedFile.name,
          type: selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown',
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          order: selectedOrder
        }
      ])
      setSelectedFile(null)
      setSelectedOrder('')
    }
  }

  return (

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>File Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search files" className="pl-8" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New File</DialogTitle>
                    <DialogDescription>
                      Choose a 3D model file to upload and associate it with an order.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file-upload" className="text-right">
                        File
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        className="col-span-3"
                        onChange={handleFileChange}
                        accept=".stl,.obj,.3mf,.step"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="order-select" className="text-right">
                        Order
                      </Label>
                      <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ORD-001">ORD-001</SelectItem>
                          <SelectItem value="ORD-002">ORD-002</SelectItem>
                          <SelectItem value="ORD-003">ORD-003</SelectItem>
                          <SelectItem value="ORD-004">ORD-004</SelectItem>
                          <SelectItem value="ORD-005">ORD-005</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleFileUpload} disabled={!selectedFile || !selectedOrder}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>{file.uploadDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          file.status === 'Approved'
                            ? 'default'
                            : file.status === 'Pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.order}</TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
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