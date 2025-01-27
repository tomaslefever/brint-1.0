/*eslint no-unused-vars: "error"*/

'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import InputMask from "react-input-mask"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Plus } from "lucide-react"
import pb from '@/app/actions/pocketbase'
// import { Customer } from '@/types/customer'
// import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import RUT from 'rut-chile';
// import { Label } from "@/components/ui/label"

const customerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    lastname: z.string().min(1, "El apellido es requerido"),
    rut: z.string()
        .min(1, "El RUT es requerido")
        .refine((val) => RUT.validate(val), {
            message: "RUT inválido",
        }),
    address: z.string().min(1, "La dirección es requerida"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(1, "El teléfono es requerido"),
})

type CustomerFormValues = z.infer<typeof customerSchema> & { id?: string }

interface AddCustomerProps {
    onCustomerAdded: () => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ onCustomerAdded }) => {
    const [isOpen, setIsOpen] = useState(false)
    // const router = useRouter()
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
        const currentUser = pb.authStore.model
        if (currentUser) {
            setCurrentUserId(currentUser.id)
        }
    }, [])

    const onSubmit = async (data: CustomerFormValues) => {
        try {
            const customerData = {
                ...data,
                created_by: currentUserId
            }
            await pb.collection('customers').create(customerData)
            toast({
                title: "Éxito",
                description: "Paciente creado correctamente",
            })
            form.reset()
            onCustomerAdded()
            setIsOpen(false)  // Cerrar el sheet
        } catch (error) {
            console.error('Error saving customer:', error)
            toast({
                title: "Error",
                description: "No se pudo guardar el paciente",
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
        name: "Nombres",
        lastname: "Apellidos",
        rut: "12.345.678-9",
        address: "Dirección",
        email: "correo@ejemplo.com",
        phone: "+56 9 1234 5678",
    }

    const labels = {
        name: "Nombres",
        lastname: "Apellidos",
        rut: "RUT",
        address: "Dirección",
        email: "Correo electrónico",
        phone: "Teléfono",
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderInput = (key: string, field: any) => {
        return (
            <FormItem className="space-y-0">
                <FormLabel className="text-xs text-muted-foreground">{labels[key as keyof typeof labels]}</FormLabel>
                <FormControl>
                    {(() => {
                        switch (key) {
                            case 'rut':
                                return (
                                    <Input
                                        {...field}
                                        placeholder={placeholders.rut}
                                        onChange={(e) => {
                                            const formattedRut = RUT.format(e.target.value);
                                            field.onChange(formattedRut);
                                        }}
                                    />
                                )
                            case 'phone':
                                return (
                                    <InputMask
                                        mask="+56 9 9999 9999"
                                        placeholder={placeholders.phone}
                                        {...field}
                                    >
                                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/(inputProps: any) => <Input {...inputProps} />}
                                    </InputMask>
                                )
                            case 'email':
                                return (
                                    <Input
                                        type="email"
                                        placeholder={placeholders.email}
                                        {...field}
                                    />
                                )
                            default:
                                return (
                                    <Input 
                                        placeholder={placeholders[key as keyof typeof placeholders]} 
                                        {...field} 
                                    />
                                )
                        }
                    })()}
                </FormControl>
                <FormMessage />
            </FormItem>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir paciente
                </Button>
            </SheetTrigger>
            <SheetContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <SheetHeader>
                            <SheetTitle>Añadir paciente</SheetTitle>
                            <SheetDescription>
                                Ingrese los detalles del paciente
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-2 py-4">
                            {Object.keys(form.getValues()).map((key) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    name={key as keyof CustomerFormValues}
                                    render={({ field }) => renderInput(key, field)}
                                />
                            ))}
                        </div>
                        <SheetFooter>
                            <Button type="submit" className="w-full">Crear Paciente</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}

export default AddCustomer
