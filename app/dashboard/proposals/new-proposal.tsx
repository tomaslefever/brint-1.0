'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import pb from '@/app/actions/pocketbase'
import { ChevronLeft, ChevronRight, Upload, Plus, X, Video } from 'lucide-react'
import { ProposalCard } from '@/components/dashboard/proposal-card'
import { Proposal } from '@/types/proposal'
import DropZone from '@/app/utils/DropZone'
import { uploadFile } from '@/utils/fileupload'

interface NewProposalProps {
  orderId: string;
  onProposalCreated?: () => void;
}

interface ImagenCargada {
  file: File;
  preview: string;
}

interface VideoCargado {
  file: File;
  name: string;
}

interface Comparison {
  id: string;
  before: ImagenCargada | null;
  after: ImagenCargada | null;
}

export default function NewProposal({ orderId, onProposalCreated }: NewProposalProps) {
  const [paso, setPaso] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Estados para el formulario - nombres actualizados según la interfaz
  const [details, setDetails] = useState('')
  const [duration, setDuration] = useState('')
  const [upper_aligners_count, setUpperAlignersCount] = useState('')
  const [lower_aligners_count, setLowerAlignersCount] = useState('')
  const [treatment_plan, setTreatmentPlan] = useState('light_single')
  const [price, setPrice] = useState('')
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState('pending')
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [videos, setVideos] = useState<VideoCargado[]>([])

  const addNewComparison = () => {
    const newComparison: Comparison = {
      id: Date.now().toString(),
      before: null,
      after: null
    }
    setComparisons([...comparisons, newComparison])
  }

  const handleImageDrop = (comparisonId: string, type: 'before' | 'after') => (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()

      reader.onloadend = () => {
        const imagenCargada: ImagenCargada = {
          file: file,
          preview: reader.result as string
        }

        setComparisons(prevComparisons => 
          prevComparisons.map(comp => 
            comp.id === comparisonId 
              ? { ...comp, [type]: imagenCargada }
              : comp
          )
        )
      }

      reader.readAsDataURL(file)
    }
  }

  const removeImage = (comparisonId: string, type: 'before' | 'after') => {
    setComparisons(prevComparisons =>
      prevComparisons.map(comp =>
        comp.id === comparisonId
          ? { ...comp, [type]: null }
          : comp
      )
    )
  }

  const removeComparison = (comparisonId: string) => {
    setComparisons(prevComparisons =>
      prevComparisons.filter(comp => comp.id !== comparisonId)
    )
  }

  const ImagePreview = ({ imagen, onDelete }: { imagen: ImagenCargada; onDelete: () => void }) => (
    <div className="relative aspect-square">
      <img src={imagen.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
      <button
        onClick={onDelete}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )

  const handleVideosDrop = (files: FileList | null) => {
    if (files) {
      const newVideos = Array.from(files).map(file => ({
        file,
        name: file.name
      }));
      setVideos(prev => [...prev, ...newVideos]);
    }
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  }

  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="details">Detalles del Tratamiento</Label>
        <Textarea 
          id="details"
          placeholder="Describe los detalles del tratamiento propuesto"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="treatment_plan">Plan de Tratamiento</Label>
          <select
            id="treatment_plan"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={treatment_plan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
          >
            <option value="light_single">Light 1 Maxilar</option>
            <option value="light_double">Light 2 Maxilares</option>
            <option value="medium_single">Medio 1 Maxilar</option>
            <option value="medium_double">Medio 2 Maxilares</option>
            <option value="full_single">Full 1 Maxilar</option>
            <option value="full_double">Full 2 Maxilares</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duración Estimada</Label>
          <Input 
            id="duration"
            placeholder="ej: 6 meses"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="upper_aligners_count">Cantidad Maxilar Superior</Label>
          <Input 
            id="upper_aligners_count"
            type="number"
            placeholder="ej: 12"
            value={upper_aligners_count}
            onChange={(e) => setUpperAlignersCount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lower_aligners_count">Cantidad Mandíbula</Label>
          <Input 
            id="lower_aligners_count"
            type="number"
            placeholder="ej: 12"
            value={lower_aligners_count}
            onChange={(e) => setLowerAlignersCount(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comments">Observaciones Adicionales</Label>
        <Textarea 
          id="comments"
          placeholder="Ingrese cualquier observación adicional"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Imágenes y videos de plan de tratamiento</Label>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addNewComparison}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comparación
          </Button>
        </div>

        <div className="space-y-4">
          {comparisons.map((comparison) => (
            <div key={comparison.id} className="border rounded-lg p-4 relative">
              <button 
                onClick={() => removeComparison(comparison.id)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Antes</Label>
                  {comparison.before ? (
                    <ImagePreview 
                      imagen={comparison.before} 
                      onDelete={() => removeImage(comparison.id, 'before')} 
                    />
                  ) : (
                    <DropZone 
                      tipo={`${comparison.id}-before`} 
                      onFileChange={(files) => handleImageDrop(comparison.id, 'before')(files)}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-xs">Arrastra o haz clic</p>
                      </div>
                    </DropZone>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Después</Label>
                  {comparison.after ? (
                    <ImagePreview 
                      imagen={comparison.after} 
                      onDelete={() => removeImage(comparison.id, 'after')} 
                    />
                  ) : (
                    <DropZone 
                      tipo={`${comparison.id}-after`} 
                      onFileChange={(files) => handleImageDrop(comparison.id, 'after')(files)}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-xs">Arrastra o haz clic</p>
                      </div>
                    </DropZone>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Label>Videos del tratamiento</Label>
          <div className="grid gap-4 max-w-72">
            <DropZone 
              tipo="videos"
              onFileChange={handleVideosDrop}
              accept="video/*"
            >
              <div className="flex flex-col items-center">
                <Video className="h-8 w-8 mb-2" />
                <p className="text-xs">Arrastra o haz clic para subir videos</p>
              </div>
            </DropZone>

            {videos.length > 0 && (
              <div className="grid gap-2">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{video.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPaso2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="price">Precio del Tratamiento</Label>
        <Input 
          id="price"
          type="number"
          placeholder="Ingrese el precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado de la Propuesta</Label>
        <select
          id="status"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>
    </div>
  )

  const handleCreateProposal = async () => {
    if (!details || !duration || !upper_aligners_count || !lower_aligners_count || !price || !treatment_plan) {
      setError('Por favor, complete todos los campos requeridos.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Subir las imágenes de comparación secuencialmente
      const uploadedComparisons = [];
      const uploadedVideos = [];
      
      for (const comp of comparisons) {
        let beforeFile = null;
        let afterFile = null;
        
        if (comp.before) {
          beforeFile = await uploadFile(
            comp.before.file, 
            orderId, 
            'comparisons'
          );
        }
        
        if (comp.after) {
          afterFile = await uploadFile(
            comp.after.file, 
            orderId, 
            'comparisons'
          );
        }
        
        uploadedComparisons.push({
          before_image: beforeFile?.id || null,
          after_image: afterFile?.id || null
        });
      }

      // Subir videos
      for (const video of videos) {
        const uploadedVideo = await uploadFile(
          video.file,
          orderId,
          'videos'
        );
        if (uploadedVideo?.id) {
          uploadedVideos.push(uploadedVideo.id);
        }
      }

      // Crear array plano de IDs
      const comparisonFiles = uploadedComparisons.reduce((acc, comp) => {
        if (comp.before_image) acc.push(comp.before_image);
        if (comp.after_image) acc.push(comp.after_image);
        return acc;
      }, [] as string[]);

      const proposalData = {
        order: orderId,
        details,
        duration,
        upper_aligners_count,
        lower_aligners_count,
        treatment_plan,
        price,
        comments,
        created_by: pb.authStore.model?.id,
        status: 'pending',
        created: new Date().toISOString(),
        comparisons: comparisonFiles,
        videos: uploadedVideos
      }

      const createdProposal = await pb.collection('proposals').create(proposalData)

      await pb.collection('orders').update(orderId, {
        status: 'proposal_sent',
        proposal: createdProposal.id
      })

      if (onProposalCreated) {
        onProposalCreated()
      }
      
      router.push(`/dashboard/orders/${orderId}`)
    } catch (error) {
      console.error('Error al crear la propuesta:', error)
      setError('Hubo un error al crear la propuesta. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="w-full space-y-4">
          <div className="flex flex-col">
            <div className='text-xs text-muted-foreground'>
              Paso {paso} de 2 - {
                paso === 1 ? "Detalles del tratamiento" : "Información comercial"
              }
            </div>
          </div>
          
          <div className="space-y-4 px-1">
            {paso === 1 ? renderPaso1() : renderPaso2()}
          </div>

          <div className="flex justify-between px-1">
            {paso > 1 && (
              <Button variant="outline" onClick={() => setPaso(paso - 1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
            )}
            {paso < 2 ? (
              <Button 
                onClick={() => setPaso(paso + 1)} 
                className="ml-auto"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                className="ml-auto" 
                onClick={handleCreateProposal} 
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Propuesta'}
              </Button>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 