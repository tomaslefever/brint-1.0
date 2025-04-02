'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import pb from '@/app/actions/pocketbase'
import { useToast } from "@/hooks/use-toast"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { RecordModel } from '@/lib/pocketbase'
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const userSchema = z.object({
    username: z.string()
        .min(1, "El nombre de usuario es requerido")
        .regex(/^[a-zA-Z0-9]+$/, "El nombre de usuario solo puede contener letras y números"),
    email: z.string().email("Correo electrónico inválido"),
    name: z.string().min(1, "El nombre es requerido"),
    lastname: z.string().min(1, "El apellido es requerido"),
    role: z.enum(["admin", "author", "client", "editor", "doctor"], {
        required_error: "Por favor seleccione un rol",
    }),
    category: z.enum(["Base", "Bronce", "Plata", "Oro"], {
        required_error: "Por favor seleccione una categoría",
    }),
    company: z.string(),
})

type UserFormValues = z.infer<typeof userSchema>

interface UpdateUserProps {
    user: RecordModel;
    onUserUpdated: () => void;
}

export function UpdateUser({ user, onUserUpdated }: UpdateUserProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()
    const [companies, setCompanies] = useState<{ id: string, name: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: user.username || "",
            email: user.email || "",
            name: user.name || "",
            lastname: user.lastname || "",
            role: (user.role as any) || "doctor",
            category: (user.category as any) || "Base",
            company: user.company || "",
        },
    })

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const fetchCompanies = async () => {
            if (isLoading) return
            setIsLoading(true)
            setError(null)
            try {
                const records = await pb.collection('companies').getFullList({
                    sort: 'name',
                    signal: controller.signal,
                })
                if (isMounted) {
                    setCompanies(records.map(company => ({ id: company.id, name: company.name })))
                }
            } catch (error) {
                if (isMounted && error instanceof Error && error.name !== 'AbortError') {
                    console.error("Error al obtener las organizaciones:", error)
                    setError('No se pudieron cargar las organizaciones')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        if (isOpen) {
            fetchCompanies()
        }

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [isOpen])

    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive",
            })
        }
    }, [error, toast])

    const onSubmit = async (data: UserFormValues) => {
        try {
            await pb.collection('users').update(user.id, {
                ...data,
            })
            setIsOpen(false)
            onUserUpdated()
            toast({
                title: "Éxito",
                description: "Usuario actualizado correctamente",
            })
        } catch (error) {
            console.error("Error al actualizar el usuario:", error)
            toast({
                title: "Error",
                description: "No se pudo actualizar el usuario. Verifica los datos e intenta nuevamente.",
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

    const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
        form.setValue('username', value)
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <DropdownMenuItem 
                    className="cursor-pointer" 
                    onSelect={(e) => {
                        e.preventDefault();
                        setIsOpen(true);
                    }}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar usuario
                </DropdownMenuItem>
            </SheetTrigger>
            <SheetContent className="h-full overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <SheetHeader>
                            <SheetTitle>Actualizar Usuario</SheetTitle>
                            <SheetDescription>
                                Modifique los detalles del usuario
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nombre de usuario
                                                </label>
                                                <Input
                                                    id="username"
                                                    placeholder="Nombre de usuario (solo letras y números)"
                                                    {...field}
                                                    onChange={handleUsernameInput}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nombres
                                                </label>
                                                <Input
                                                    placeholder="Nombres"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Apellidos
                                                </label>
                                                <Input
                                                    placeholder="Apellidos"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Correo electrónico
                                                </label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="correo@ejemplo.com"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                                Rol
                                            </label>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger id="role">
                                                        <SelectValue placeholder="Seleccione un rol" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="author">Autor</SelectItem>
                                                    <SelectItem value="client">Cliente</SelectItem>
                                                    <SelectItem value="editor">Editor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría del Doctor
                                            </label>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger id="category">
                                                        <SelectValue placeholder="Seleccione una categoría" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Base">Base</SelectItem>
                                                    <SelectItem value="Bronce">Bronce</SelectItem>
                                                    <SelectItem value="Plata">Plata</SelectItem>
                                                    <SelectItem value="Oro">Oro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                            Organización
                                        </label>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger id="company">
                                                    <SelectValue placeholder="Seleccione una organización" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {companies.map((company) => (
                                                        <SelectItem key={company.id} value={company.id}>
                                                            {company.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <SheetFooter>
                            <Button type="submit" className="w-full">Actualizar Usuario</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
