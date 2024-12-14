import { Customer } from './customer'
import { File } from './files'
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

  comparisons: File[]
  videos: File[]
  imagenes: File[]
  attachments: File[]
  informe: File
  
  // Campos expandidos (opcionales)
  expand: {
    order: Order
    created_by: User
    customer: Customer
    comparisons: File[]
  }
  // onProposalCreated?: () => void;
  orderId: string
}
