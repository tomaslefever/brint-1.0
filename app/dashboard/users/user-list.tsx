'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, CircleX } from "lucide-react"
import { RecordModel } from 'pocketbase'
import { useToast } from "@/hooks/use-toast"
import pb from '@/app/actions/pocketbase'
import { motion, AnimatePresence } from 'framer-motion'
import { UpdateUser } from './update-user'
import { useRouter } from 'next/navigation'

interface UserListProps {
  searchTerm: string;
  refreshTrigger: number;
  onRefreshTriggered: () => void;
}

export default function UserList({ searchTerm, refreshTrigger, onRefreshTriggered }: UserListProps) {
  const [users, setUsers] = useState<RecordModel[]>([])
  const { toast } = useToast()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadUsers = async () => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const records = await pb.collection('users').getFullList({
          sort: '-created',
          filter: searchTerm ? `name ~ "${searchTerm}" || email ~ "${searchTerm}"` : '',
          expand: 'role',
          // fields: '',
          // fields: 'id,name,lastname,email,role,username',
        });
        if (isMounted) {
          setUsers(records);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && error.name !== 'AbortError') {
          console.error('Error al obtener usuarios:', error);
          setError('No se pudieron cargar los usuarios');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchTerm, refreshTrigger, onRefreshTriggered]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleDeleteUser = async (id: string) => {
    try {
      await pb.collection('users').delete(id)
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
      setConfirmDeleteId(null)
      setOpenDropdownId(null)
      onRefreshTriggered()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const buttonVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const cancelButtonVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre de usuario</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow 
            key={user.id} 
            className="cursor-pointer"
            // onClick={() => router.push(`/dashboard/users/${user.id}`)}
          >
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <DropdownMenu 
                open={openDropdownId === user.id} 
                onOpenChange={(open) => {
                  if (open) {
                    setOpenDropdownId(user.id ?? null)
                  } else if (!confirmDeleteId) {
                    setOpenDropdownId(null)
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <UpdateUser user={user} onUserUpdated={onRefreshTriggered} />
                  <DropdownMenuSeparator />
                  <AnimatePresence mode="wait">
                    {confirmDeleteId === user.id ? (
                      <motion.div
                        key="confirm"
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <DropdownMenuItem 
                          className="bg-red-600 text-white cursor-pointer hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            user.id && handleDeleteUser(user.id);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Confirmar
                        </DropdownMenuItem>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="delete"
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(user.id ?? null);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Eliminar usuario
                        </DropdownMenuItem>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {confirmDeleteId === user.id && (
                      <motion.div
                        variants={cancelButtonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <DropdownMenuItem 
                          className="text-gray-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                        >
                          <CircleX className="mr-2 h-4 w-4" /> Cancelar
                        </DropdownMenuItem>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
