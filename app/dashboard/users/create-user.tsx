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
import { Plus } from "lucide-react"
import pb from '@/app/actions/pocketbase'
import { useToast } from "@/hooks/use-toast"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"

const userSchema = z.object({
    username: z.string()
        .min(1, "El nombre de usuario es requerido")
        .regex(/^[a-zA-Z0-9]+$/, "El nombre de usuario solo puede contener letras y números"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(72, "La contraseña no puede tener más de 72 caracteres"),
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

interface CreateUserProps {
    onUserAdded: () => void;
}

function generateRandomPassword(length: number = 12): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]<>,.?~"
    let password = ""
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
}

export function CreateUser({ onUserAdded }: CreateUserProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()
    const [companies, setCompanies] = useState<{ id: string, name: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            name: "",
            lastname: "",
            role: "doctor",
            category: "Base",
            company: "",
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
            await pb.collection('users').create({
                ...data,
                passwordConfirm: data.password,
            })
            setIsOpen(false)
            form.reset()
            onUserAdded()
            toast({
                title: "Éxito",
                description: "Usuario creado correctamente",
            })
        } catch (error) {
            console.error("Error al crear el usuario:", error)
            toast({
                title: "Error",
                description: "No se pudo crear el usuario. Verifica los datos e intenta nuevamente.",
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
        username: "Nombre de usuario (solo letras y números)",
        email: "correo@ejemplo.com",
        password: "Contraseña (8-72 caracteres)",
        name: "Nombres",
        lastname: "Apellidos",
        company: "Nombre de la organización",
    }

    const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
        form.setValue('username', value)
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Usuario
                </Button>
            </SheetTrigger>
            <SheetContent className="h-full overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} >
                        <SheetHeader>
                            <SheetTitle>Crear Nuevo Usuario</SheetTitle>
                            <SheetDescription>
                                Ingrese los detalles del usuario
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
                                                    placeholder={placeholders.username}
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
                                                    placeholder={placeholders.name}
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
                                                    placeholder={placeholders.lastname}
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
                                                    placeholder={placeholders.email}
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contraseña
                                                </label>
                                                <Input
                                                    type="text"
                                                placeholder={placeholders.password}
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
                            <Button type="submit" className="w-full">Crear Usuario</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
