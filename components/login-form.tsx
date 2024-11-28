'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import PocketBase from 'pocketbase'
import Image from 'next/image'
import { Separator } from './ui/separator'
const pb = new PocketBase('http://127.0.0.1:8090')

export default function LoginComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      
      // Actualizar el campo 'last_login' del usuario
      await pb.collection('users').update(authData.record.id, {
        last_login: new Date().toISOString(),
      })

      localStorage.setItem('authToken', authData.token)
      setIsAuthenticated(true)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to login. Please check your credentials.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Bienvenido de nuevo</CardTitle>
          <CardDescription>Redirigiendo al dashboard...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex justify-center items-center space-y-4">
        <Image src="/img/logo.png" alt="Logo" width={200} height={100} />
        <Separator className='w-full my-4' />
        <div className="flex flex-col items-center space-y-2">
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription className='text-center'>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input 
                id="email" 
                type="email" 
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input 
                id="password" 
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Autenticando...' : 'Ingresar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
