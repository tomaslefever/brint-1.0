'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Customer } from '@/types/customer'
import pb from '@/app/actions/pocketbase'

interface SelectClientsProps {
  onClientSelect: (clientId: string) => void;
  selectedClientId: string | null;
}

export default function SelectClients({ onClientSelect, selectedClientId }: SelectClientsProps) {
  const [clients, setClients] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewClientInput, setShowNewClientInput] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: '',
    lastname: ''
  })

  const currentUser = pb.authStore.model;

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const records = await pb.collection('customers').getFullList<Customer>({
          sort: 'created',
          filter: currentUser?.role === 'admin' 
            ? '' 
            : `created_by = "${currentUser?.id}"`,
          requestKey: null,
          $autoCancel: false
        });
        setClients(records);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('No se pudieron cargar los pacientes')
      } finally {
        setIsLoading(false)
      }
    };

    fetchClients();
  }, [currentUser?.id, currentUser?.role]);

  const handleClientSelect = async (value: string) => {
    if (value === 'new') {
      setShowNewClientInput(true)
      onClientSelect('')
    } else {
      setShowNewClientInput(false)
      onClientSelect(value)
    }
  }

  const handleNewClientSubmit = async () => {
    if (!newClientData.name.trim() || !newClientData.lastname.trim()) return;

    try {
      const newClient = await pb.collection('customers').create({
        name: newClientData.name,
        lastname: newClientData.lastname,
        created_by: currentUser?.id
      });
      
      setClients(prev => [...prev, newClient as unknown as Customer]);
      onClientSelect(newClient.id);
      setShowNewClientInput(false);
      setNewClientData({ name: '', lastname: '' });
    } catch (error) {
      console.error('Error creating client:', error);
      setError('No se pudo crear el paciente');
    }
  }

  if (isLoading) return <div>Cargando pacientes...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-2">
      <Select 
        value={selectedClientId || undefined} 
        onValueChange={handleClientSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccione un paciente">
            {selectedClientId && clients.find(client => client.id === selectedClientId)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">+ Agregar paciente</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name} {client.lastname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showNewClientInput && (
        <div className="space-y-2">
          <Input
            placeholder="Nombre del paciente"
            value={newClientData.name}
            onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Apellido del paciente"
              value={newClientData.lastname}
              onChange={(e) => setNewClientData(prev => ({ ...prev, lastname: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNewClientSubmit();
                }
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleNewClientSubmit();
              }}
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}