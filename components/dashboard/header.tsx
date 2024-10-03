'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import PocketBase from 'pocketbase'
const pb = new PocketBase('http://127.0.0.1:8090')

const currentUser = pb.authStore.model ? pb.authStore.model : 'Invitado';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  date: Date;
  user: {
    name: string;
    avatar: string;
  };
}

const Header: React.FC = () => {
 
  console.log(pb.authStore);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'Nuevo pedido recibido',
      read: false,
      date: new Date(2023, 4, 15, 10, 30),
      user: { name: 'Juan Pérez', avatar: '/avatars/juan.png' }
    },
    {
      id: 2,
      message: 'Escaneo programado en 1 hora',
      read: false,
      date: new Date(2023, 4, 15, 14, 0),
      user: { name: 'María González', avatar: '/avatars/maria.png' }
    },
    {
      id: 3,
      message: 'Archivo listo para revisión',
      read: false,
      date: new Date(2023, 4, 16, 9, 15),
      user: { name: 'Carlos Rodríguez', avatar: '/avatars/carlos.png' }
    },
    {
      id: 4,
      message: 'Nueva tarea asignada',
      read: false,
      date: new Date(2023, 4, 16, 10, 0),
      user: { name: 'Luis Martínez', avatar: '/avatars/luis.png' }
    },
    {
      id: 5,
      message: 'Reunión programada para mañana',
      read: false,
      date: new Date(2023, 4, 16, 15, 0),
      user: { name: 'Sofía López', avatar: '/avatars/sofia.png' }
    },
    {
      id: 6,
      message: 'Informe mensual listo',
      read: false,
      date: new Date(2023, 4, 17, 9, 0),
      user: { name: 'Pedro Sánchez', avatar: '/avatars/pedro.png' }
    },
    {
      id: 7,
      message: 'Nuevo comentario en tu publicación',
      read: false,
      date: new Date(2023, 4, 17, 12, 30),
      user: { name: 'Laura Jiménez', avatar: '/avatars/laura.png' }
    },
    {
      id: 8,
      message: 'Actualización de estado de proyecto',
      read: true,
      date: new Date(2023, 4, 17, 14, 0),
      user: { name: 'Javier Gómez', avatar: '/avatars/javier.png' }
    },
    {
      id: 9,
      message: 'Recordatorio de pago',
      read: true,
      date: new Date(2023, 4, 18, 8, 0),
      user: { name: 'Claudia Ruiz', avatar: '/avatars/claudia.png' }
    },
    {
      id: 10,
      message: 'Nueva actualización disponible',
      read: true,
      date: new Date(2023, 4, 18, 11, 0),
      user: { name: 'Ana Torres', avatar: '/avatars/ana.png' }
    },
    {
      id: 11,
      message: 'Cambio en la política de privacidad',
      read: true,
      date: new Date(2023, 4, 18, 13, 0),
      user: { name: 'Fernando Díaz', avatar: '/avatars/fernando.png' }
    },
    {
      id: 12,
      message: 'Nuevo mensaje en el chat',
      read: true,
      date: new Date(2023, 4, 18, 15, 0),
      user: { name: 'Isabel Castro', avatar: '/avatars/isabel.png' }
    },
    {
      id: 13,
      message: 'Actualización de la aplicación',
      read: true,
      date: new Date(2023, 4, 19, 9, 0),
      user: { name: 'Ricardo Torres', avatar: '/avatars/ricardo.png' }
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };
  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
  };


  return (
    <header className="flex items-center justify-between py-4 px-8 md:ml-64">
      <h1 className="text-lg font-bold text-gray-800">Bienvenido {/*currentUser.name*/}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 px-2 py-1 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <DropdownMenuItem>No hay notificaciones nuevas</DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex items-start py-3">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className={`text-sm ${notification.read ? 'text-gray-500' : 'font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.user.name} - {formatDate(notification.date)}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <EnvelopeOpenIcon />
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;