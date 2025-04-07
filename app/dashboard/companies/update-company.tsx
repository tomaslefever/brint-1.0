'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Pencil } from "lucide-react"
import { Company } from '@/types/company'
import pb from '@/app/actions/pocketbase'
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface UpdateCompanyProps {
  company: Company;
  onCompanyUpdated: () => void;
}

export function UpdateCompany({ company, onCompanyUpdated }: UpdateCompanyProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name || "",
      address: company.address || "",
      phone: company.phone || "",
    },
  })

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      await pb.collection('companies').update(company.id, data)
      toast({
        title: "Éxito",
        description: "Organización actualizada correctamente",
      })
      setIsOpen(false)
      onCompanyUpdated()
    } catch (error) {
      console.error('Error updating company:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la organización",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem 
          className='cursor-pointer'
          onSelect={(event) => {
            event.preventDefault()
            setIsOpen(true)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" /> Editar organización
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Organización</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la organización" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección de la organización" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de la organización" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Guardar cambios</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
} 