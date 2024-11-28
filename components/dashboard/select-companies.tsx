'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const records = await pb.collection('companies').getFullList<Company>({
          sort: 'created',
          requestKey: null
        });
        setCompanies(records);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('No se pudieron cargar las organizaciones')
      } finally {
        setIsLoading(false)
      }
    };

    fetchCompanies();
  }, []);

  if (isLoading) return <div>Cargando organizaciones...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Select onValueChange={onCompanySelect} value={selectedCompanyId || undefined}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccione una organización" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id || ''}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
