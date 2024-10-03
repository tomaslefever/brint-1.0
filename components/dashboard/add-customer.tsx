'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus } from "lucide-react"
import pb from '@/app/actions/pocketbase'
import { Customer } from '@/types/customer'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const customerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    lastname: z.string().min(1, "El apellido es requerido"),
    rut: z.string().min(1, "El RUT es requerido"),
    address: z.string().min(1, "La dirección es requerida"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(1, "El teléfono es requerido"),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface AddCustomerProps {
    onCustomerAdded: () => void;
}

const AddCustomer = function AddCustomer({ onCustomerAdded }: AddCustomerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            lastname: "",
            rut: "",
            address: "",
            email: "",
            phone: "",
        },
    })

    useEffect(() => {
        const user = pb.authStore.model
        if (user) {
            setCurrentUserId(user.id)
        }
    }, [])

    const onSubmit = async (data: CustomerFormValues) => {
        try {
            if (!currentUserId) {
                throw new Error("No hay usuario autenticado")
            }
            const newCustomer = {
                ...data,
                created_by: currentUserId
            }
            await pb.collection('customers').create(newCustomer)
            setIsOpen(false)
            form.reset()
            onCustomerAdded()
            toast({
                title: "Éxito",
                description: "Paciente añadido correctamente",
            })
        } catch (error) {
            console.error("Error al crear el paciente:", error)
            toast({
                title: "Error",
                description: "No se pudo crear el paciente",
                variant: "destructive",
            })
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset()
        }
        setIsOpen(open)
    }

    const placeholders = {
        name: "Nombre",
        lastname: "Apellido",
        rut: "RUT",
        address: "Dirección",
        email: "Correo electrónico",
        phone: "Teléfono",
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Añadir paciente</DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles del paciente
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {Object.keys(form.getValues()).map((key) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    name={key as keyof CustomerFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input 
                                                    placeholder={placeholders[key as keyof typeof placeholders]} 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">Guardar paciente</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomer