'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Company } from '@/types/company'
import pb from '@/app/actions/pocketbase'

interface SelectCompaniesProps {
  onCompanySelect: (companyId: string) => void;
  selectedCompanyId: string | null;
}

export default function SelectCompanies({ onCompanySelect, selectedCompanyId }: SelectCompaniesProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewCompanyInput, setShowNewCompanyInput] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')

  const currentUser = pb.authStore.model;

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const records = await pb.collection('companies').getFullList<Company>({
          sort: 'created',
          filter: currentUser?.role === 'admin' 
            ? '' 
            : `created_by = "${currentUser?.id}"`,
          requestKey: null,
          $autoCancel: false
        });
        
        console.log('Fetched companies:', records);
        setCompanies(records);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('No se pudieron cargar las organizaciones')
      } finally {
        setIsLoading(false)
      }
    };

    fetchCompanies();
  }, [currentUser?.id, currentUser?.role]);

  const handleCompanySelect = async (value: string) => {
    if (value === 'new') {
      setShowNewCompanyInput(true)
      onCompanySelect('')
    } else {
      setShowNewCompanyInput(false)
      onCompanySelect(value)
    }
  }

  const handleNewCompanySubmit = async () => {
    if (!newCompanyName.trim()) return;

    try {
      const newCompany = await pb.collection('companies').create({
        name: newCompanyName,
        created_by: currentUser?.id
      });
      
      setCompanies(prev => [...prev, newCompany as unknown as Company]);
      onCompanySelect(newCompany.id);
      setShowNewCompanyInput(false);
      setNewCompanyName('');
    } catch (error) {
      console.error('Error creating company:', error);
      setError('No se pudo crear la organización');
    }
  }

  if (isLoading) return <div>Cargando organizaciones...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-2">
      <Select onValueChange={handleCompanySelect} value={selectedCompanyId || undefined}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccione una organización" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">+ Agregar organización</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id || ''}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showNewCompanyInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de la nueva organización"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleNewCompanySubmit();
              }
            }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNewCompanySubmit();
            }}
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}
