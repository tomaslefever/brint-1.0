'use client'

import { useState } from 'react'
import { Bell, User, Lock, Globe, Moon, Sun, Laptop } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const [theme, setTheme] = useState('system')

  return (
    <Card className="mb-6 p-4 max-w-2xl">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="display">Visualización</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Gestiona tu información de perfil y cómo se muestra a otros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" defaultValue="Dr. Juan Pérez" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" defaultValue="juan.perez@ejemplo.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  placeholder="Cuéntanos sobre ti..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>
                Actualiza la configuración de tu cuenta y gestiona tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Actualizar contraseña</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibes notificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications-email">Notificaciones por correo</Label>
                <Switch id="notifications-email" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications-push">Notificaciones push</Label>
                <Switch id="notifications-push" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notification-frequency">Frecuencia de notificaciones</Label>
                <Select>
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Selecciona la frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Tiempo real</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar preferencias</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Visualización</CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Tema</Label>
                <RadioGroup defaultValue={theme} onValueChange={setTheme} className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light"><Sun className="h-4 w-4" /></Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark"><Moon className="h-4 w-4" /></Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system"><Laptop className="h-4 w-4" /></Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-1">
                <Label htmlFor="language">Idioma</Label>
                <Select>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecciona el idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Aplicar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  )
}