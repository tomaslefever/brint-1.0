'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2Icon, Info, InfoIcon, MessageCircle, MessageCircleWarning, X, XCircle } from 'lucide-react';
import Link from 'next/link';
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
import { format } from 'date-fns';import PocketBase from 'pocketbase';
import { Notification } from '@/types/notification';
import TimeAgo from 'javascript-time-ago'
import es from 'javascript-time-ago/locale/es'

TimeAgo.addDefaultLocale(es)
const timeAgo = new TimeAgo('es-ES')

const pb = new PocketBase('https://innovaligners.pockethost.io/');

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) {
        console.error('Usuario no autenticado');
        return;
      }

      
      
      const records = await pb.collection('notifications').getList(1, 50, {
        sort: '-created',
        filter: pb.authStore.model?.role === 'admin' ? '' : `user = "${userId}"`,
        expand: 'user,order',
        requestKey: null,
      });
      setNotifications(records.items as unknown as Notification[]);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await pb.collection('notifications').update(id, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
    };

  // const deleteAllNotifications = async () => {
  //   try {
  //     await pb.collection('notifications').delete();
  //     fetchNotifications();
  //   } catch (error) {
  //     console.error('Error al eliminar todas las notificaciones:', error);
  //   }
  // };

  return (
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
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span className='font-medium'>Notificaciones</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <DropdownMenuItem>No hay notificaciones nuevas</DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex items-start py-3 hover:bg-slate-100">
                {notification.type === 'info' && <InfoIcon className={`${notification.read ? 'text-muted-foreground' : 'text-sky-300 dark:text-sky-600'} h-6 w-8 mr-3`} />}
                {notification.type === 'warning' && <MessageCircleWarning className={`${notification.read ? 'text-muted-foreground' : 'text-yellow-500 dark:text-yellow-600'} h-6 w-8 mr-3`} />}
                {notification.type === 'error' && <XCircle className={`${notification.read ? 'text-muted-foreground' : 'text-red-300 dark:text-red-600'} h-6 w-8 mr-3`} />}
                {notification.type === 'success' && <CheckCircle2Icon className={`${notification.read ? 'text-muted-foreground' : 'text-green-300 dark:text-green-600'} h-6 w-8 mr-3`} />}
                {notification.type === 'comment' && <MessageCircle className={`${notification.read ? 'text-muted-foreground' : 'text-blue-300 dark:text-blue-600'} h-6 w-8 mr-3`} />}
                <div className="flex-1">
                  <p className={`text-sm hover:underline ${notification.read ? 'text-gray-500' : 'font-medium'}`}>
                    <Link href={`/dashboard/orders/${notification.expand?.order?.id}`} key={notification.id} onClick={() => markAsRead(notification.id)}>
                      {notification.message}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo.format(new Date(notification.created))}
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
