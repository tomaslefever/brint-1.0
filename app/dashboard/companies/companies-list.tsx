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
import { Box, MoreHorizontal, Pencil, Trash, CircleX } from "lucide-react"
import PocketBase from 'pocketbase'
import { Company } from '@/types/company'
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion'

import pb from '@/app/actions/pocketbase'

interface CompaniesListProps {
  searchTerm: string;
  refreshTrigger: number;
  onRefreshTriggered: () => void;
}

export default function CompaniesList({ searchTerm, refreshTrigger, onRefreshTriggered }: CompaniesListProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const { toast } = useToast()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRole = pb.authStore.model?.role;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCompanies = async () => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const permissionFilter = userRole !== 'admin' ? `created_by = "${pb.authStore.model?.id}"` : '';
        console.log('permissionFilter', permissionFilter);
        const records = await pb.collection('companies').getFullList<Company>({
          sort: '-created',
          expand: 'created_by',
          // filter: permissionFilter,
          requestKey: null
        });
        if (isMounted) {
          setCompanies(records);
          console.log('records', records);
        }
      } catch (error) {
        if (isMounted && error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching companies:', error);
          setError('No se pudieron cargar las organizaciones');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCompanies();

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

  const handleDeleteCompany = async (id: string) => {
    try {
      await pb.collection('companies').delete(id)
      toast({
        title: "Éxito",
        description: "Organización eliminada correctamente",
      })
      setConfirmDeleteId(null)
      setOpenDropdownId(null)
    } catch (error) {
      console.error('Error deleting company:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la organización",
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="font-medium">{company.address}</TableCell>
              <TableCell className="font-medium">{company.phone}</TableCell>
              <TableCell>
                <DropdownMenu 
                  open={openDropdownId === company.id} 
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenDropdownId(company.id ?? null)
                    } else if (!confirmDeleteId) {
                      setOpenDropdownId(null)
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem className='cursor-pointer'><Pencil className="mr-2 h-4 w-4" />Editar organización</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AnimatePresence mode="wait">
                      {confirmDeleteId === company.id ? (
                        <motion.div
                          key="confirm"
                          variants={buttonVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <DropdownMenuItem 
                            className="bg-red-600 text-white cursor-pointer hover:bg-red-700"
                            onClick={() => company.id && handleDeleteCompany(company.id)}
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
                            onClick={() => setConfirmDeleteId(company.id ?? null)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Eliminar organización
                          </DropdownMenuItem>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {confirmDeleteId === company.id && (
                        <motion.div
                          variants={cancelButtonVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <DropdownMenuItem 
                            className="text-gray-600 cursor-pointer"
                            onClick={() => setConfirmDeleteId(null)}
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
    </>
  )
}
