'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

interface Client {
  id: string;
  name: string;
  lastname: string;
  email: string;
}

interface SelectClientsProps {
  onClientSelect: (clientId: string) => void;
  selectedClientId?: string | null;
}

export function SelectClients({ onClientSelect, selectedClientId }: SelectClientsProps) {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const records = await pb.collection('customers').getFullList<Client>({
          sort: '-created',
        });
        setClients(records)
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    fetchClients()
  }, [])

  return (
    <Select onValueChange={onClientSelect} value={selectedClientId || undefined}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccione un cliente" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {`${client.name} ${client.lastname} - ${client.email}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectClients