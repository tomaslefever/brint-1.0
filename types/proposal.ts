import { Customer } from './customer'
import { Order } from './order'
import { User } from './users'

export interface Proposal {
  id: string
  created: string
  updated: string
  
  order: Order
  customer: Customer
  created_by: User

  status: string
  details: string
  duration: string
  aligners_count: string
  price: string
  comments: string
  
  // Campos expandidos (opcionales)
  expand?: {
    order?: Order
    created_by?: User
    customer?: Customer
  }
  // onProposalCreated?: () => void;
  orderId: string
}
