'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import PocketBase from 'pocketbase'
const pb = new PocketBase('http://127.0.0.1:8090')

export default function LoginComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  pb.authStore.token ? router.push('/dashboard') : console.log('Not logged in');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Authenticate with PocketBase
      const authData = await pb.collection('users').authWithPassword(email, password)

      console.log('Authentication successful')
      console.log('Is valid:', pb.authStore.isValid)
      console.log('Token:', pb.authStore.token)
      console.log('User ID:', pb.authStore.model?.id)

      // If login is successful, redirect to dashboard
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

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Enter your password"
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
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}