import { ReactNode } from 'react'
import { cn } from "@/lib/utils"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import Lightbox from 'yet-another-react-lightbox'

export function Timeline({ children }: { children: ReactNode }) {
  return (
    <div className="relative ml-3">
      <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
      <div className="space-y-8">{children}</div>
    </div>
  )
}

interface TimelineItemProps {
  date: Date
  title: string
  type: 'order' | 'notification' | 'appointment' | 'proposal'
  children: ReactNode
}

export function TimelineItem({ date, title, type, children }: TimelineItemProps) {
  return (
    <div className="relative pl-8">
      <div className={cn(
        "absolute left-[-5px] h-3 w-3 rounded-full translate-y-2 border-2 border-white",
        {
          'bg-blue-500': type === 'order',
          'bg-green-500': type === 'appointment',
          'bg-yellow-500': type === 'notification',
          'bg-purple-500': type === 'proposal',
        }
      )} />
      <div className="mb-2">
        <time className="text-sm text-gray-500">
          {date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </time>
        <h3 className="text-sm">{type == 'order' ? 'Orden creada' : type == 'proposal' ? 'Propuesta enviada' : '' }</h3>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
} 