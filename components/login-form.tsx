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
import { Eye, EyeOff } from "lucide-react"
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

export default function LoginComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordRecover, setPasswordRecover] = useState(false)

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
      
      await pb.collection('users').update(authData.record.id, {
        last_login: new Date().toISOString(),
      })

      localStorage.setItem('authToken', authData.token)
      setIsAuthenticated(true)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error && err.message.includes('no rows in result set')) {
        setError('Datos incorrectos')
      } else if (err instanceof Error) {
        setError('Datos incorrectos')
      } else {
        setError('Datos incorrectos')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordRecover = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico para recuperar tu contraseña');
      return;
    }
    
    setIsLoading(true);
    try {
      await pb.collection('users').requestPasswordReset(email);
      setError('');
      setPasswordRecover(false);
      alert('Se ha enviado un correo con las instrucciones para recuperar tu contraseña');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'No se pudo enviar el correo de recuperación');
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
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
          <CardTitle>{passwordRecover ? 'Recuperar contraseña' : 'Inicia sesión'}</CardTitle>
          <CardDescription className='text-center'>
            {passwordRecover 
              ? 'Ingresa tu correo electrónico para recibir un enlace de recuperación' 
              : 'Ingresa tus credenciales para acceder a tu cuenta'}
          </CardDescription>
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
            {!passwordRecover && (
              <div className="flex flex-col space-y-1.5">
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className='flex flex-col space-y-3'>
          {passwordRecover ? (
            <Button 
              className="w-full" 
              type="button" 
              onClick={handlePasswordRecover}
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperación'}
            </Button>
          ) : (
            <>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Autenticando...' : 'Ingresar'}
              </Button>
              <div>
                <Button 
                  variant='link' 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPasswordRecover(true);
                  }}
                  disabled={isLoading}
                >
                  Olvidé mi contraseña
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
