'use client'

import { useState, useCallback } from 'react'
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import CustomerList from './customer-list'
import AddCustomer from './add-customer'

export default function CustomersScreen() {
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const handleCustomerAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className='text-2xl'>Pacientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar paciente" 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddCustomer onCustomerAdded={handleCustomerAdded} />
        </div>
        <CustomerList 
        searchTerm={searchTerm} 
        refreshTrigger={refreshTrigger}
          onRefreshTriggered={() => setRefreshTrigger(0)}
        />
      </CardContent>
    </Card>
  )
}