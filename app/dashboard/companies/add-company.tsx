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
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import RUT from 'rut-chile';
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select"

const companySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    comuna: z.string(),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface AddCompanyProps {
    onCustomerAdded: () => void;
}

const AddCompany = function AddCompany({ onCustomerAdded }: AddCompanyProps) {
    const [isOpen, setIsOpen] = useState(false)
    // const router = useRouter()
    const { toast } = useToast()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "",
            address: "",
            email: "",
            comuna: "",
            phone: "",
        },
    })

    useEffect(() => {
        const user = pb.authStore.model
        if (user) {
            setCurrentUserId(user.id)
        }
    }, [])

    const onSubmit = async (data: CompanyFormValues) => {
        try {
            if (!currentUserId) {
                throw new Error("No hay usuario autenticado")
            }
            const newCompany = {
                ...data,
                created_by: currentUserId
            }
            await pb.collection('companies').create(newCompany)
            setIsOpen(false)
            form.reset()
            onCustomerAdded()
            toast({
                title: "Organización creada",
                description: "Se ha creado la organización correctamente",
                duration: 3000,
            })
        } catch (error) {
            console.error("Error al crear la organización:", error)
            toast({
                title: "Error",
                description: "No se pudo crear la organización",
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
        address: "Dirección",
        email: "correo@ejemplo.com",
        phone: "+56 9 1234 5678",
        rut: "12.345.678-9",
        comuna: "Comuna",
    }

    const labels = {
        name: "Nombre establecimiento",
        address: "Dirección",
        email: "Correo electrónico",
        phone: "Teléfono",
        rut: "RUT",
        comuna: "Comuna",
    }

    const renderInput = (key: string, field: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (
            <FormItem className="space-y-0">
                <FormLabel className="text-xs text-muted-foreground">{labels[key as keyof typeof labels]}</FormLabel>
                <FormControl>
                    {(() => {
                        switch (key) {
                            case 'phone':
                                return (
                                    <InputMask
                                        mask="+56 9 9999 9999"
                                        placeholder={placeholders.phone}
                                        {...field}
                                    >
                                        {(inputProps: any) => <Input {...inputProps} />}
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
                            case 'rut':
                                return (
                                    <InputMask
                                        mask="99.999.999-9"
                                        placeholder={placeholders.rut}
                                        {...field}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            field.onChange(RUT.format(e.target.value))
                                        }}
                                    >
                                        {(inputProps: any) => <Input {...inputProps} />}
                                    </InputMask>
                                )
                                case 'comuna': 
                                return (
                                    <Select
                                        {...field}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={placeholders.comuna} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Santiago">Santiago</SelectItem>
                                            <SelectItem value="Valparaíso">Valparaíso</SelectItem>
                                        </SelectContent>
                                    </Select>   
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
                    Añadir organización
                </Button>
            </SheetTrigger>
            <SheetContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <SheetHeader>
                            <SheetTitle>Añadir organización</SheetTitle>
                            <SheetDescription>
                                Ingrese los detalles de la organización
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-2 py-4">
                            {Object.keys(form.getValues()).map((key) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    name={key as keyof CompanyFormValues}
                                    render={({ field }) => renderInput(key, field)}
                                />
                            ))}
                        </div>
                        <SheetFooter>
                            <Button type="submit" className="w-full">Guardar organización</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}

export default AddCompany
