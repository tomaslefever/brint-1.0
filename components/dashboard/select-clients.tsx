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
    lastname: '',
    surname: '',
    age: ''
  })

  const currentUser = pb.authStore.model;

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
        autoCancel: false
      });
      setClients(records);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('No se pudieron cargar los pacientes')
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
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
    if (!newClientData.name.trim() || !newClientData.lastname.trim() || !newClientData.surname.trim() || !newClientData.age.trim()) return;

    try {
      const newClient = await pb.collection('customers').create({
        name: newClientData.name,
        lastname: newClientData.lastname,
        surname: newClientData.surname,
        age: newClientData.age,
        created_by: currentUser?.id
      });

      // Limpiar el formulario y ocultar el input
      setShowNewClientInput(false);
      setNewClientData({ name: '', lastname: '', surname: '', age: '' });
      
      // Recargar la lista de clientes
      await fetchClients();
      
      // Seleccionar el nuevo cliente
      onClientSelect(newClient.id);
      
    } catch (error) {
      console.error('Error creating client:', error);
      setError('No se pudo crear el paciente');
    }
  }

  console.log('Estado actual - selectedClientId:', selectedClientId);
  console.log('Estado actual - clients:', clients);

  if (isLoading) return <div>Cargando pacientes...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-2">
      <Select 
        value={selectedClientId || ''} 
        onValueChange={handleClientSelect}
      >
        <SelectTrigger>
          <SelectValue>
            {selectedClientId && clients.find(client => client.id === selectedClientId) 
              ? `${clients.find(client => client.id === selectedClientId)?.name} ${clients.find(client => client.id === selectedClientId)?.lastname} ${clients.find(client => client.id === selectedClientId)?.surname}`
              : 'Seleccione un paciente'
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">+ Agregar paciente</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {`${client.name} ${client.lastname} ${client.surname}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showNewClientInput && (
        <div className="space-y-2 flex flex-col">
          <Input
            placeholder="Nombres del paciente"
            value={newClientData.name}
            onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Primer apellido"
              value={newClientData.lastname}
              onChange={(e) => setNewClientData(prev => ({ ...prev, lastname: e.target.value }))}
            />
            <Input
              placeholder="Segundo apellido"
              value={newClientData.surname}
              onChange={(e) => setNewClientData(prev => ({ ...prev, surname: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Edad"
              value={newClientData.age}
              onChange={(e) => setNewClientData(prev => ({ ...prev, age: e.target.value }))}
              type="number"
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNewClientSubmit();
            }}
            type="button"
            className="px-4 py-2 bg-sky-800 text-primary-foreground rounded-md hover:bg-sky-700"
          >
            Crear nuevo paciente
          </button>
        </div>
      )}
    </div>
  )
}