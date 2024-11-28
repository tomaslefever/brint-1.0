import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

interface DropZoneProps {
  tipo: string;
  children?: React.ReactNode;
  onFileChange: (files: FileList | null, tipo: string) => void;
}

export default function DropZone({ tipo, children, onFileChange }: DropZoneProps) {
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onFileChange(e.dataTransfer.files, tipo)
  }

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors aspect-square flex items-center justify-center"
    >
      <Input
        type="file"
        onChange={(e) => onFileChange(e.target.files, tipo)}
        accept="image/*"
        className="hidden"
        id={`file-input-${tipo}`}
      />
      <label htmlFor={`file-input-${tipo}`} className="cursor-pointer">
        {children || (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-xs">Arrastra o haz clic</p>
          </div>
        )}
      </label>
    </div>
  )
} 