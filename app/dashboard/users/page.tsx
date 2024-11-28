'use client'

import { useState, useCallback } from 'react'
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreateUser } from './create-user'
import UserList from './user-list'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className='text-2xl'>Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar usuario" 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CreateUser onUserAdded={handleRefresh} />
        </div>
        <UserList 
          searchTerm={searchTerm} 
          refreshTrigger={refreshTrigger}
          onRefreshTriggered={handleRefresh}
        />
      </CardContent>
    </Card>
  )
}
