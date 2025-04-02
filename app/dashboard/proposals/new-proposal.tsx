'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import pb from '@/app/actions/pocketbase'
import { ChevronLeft, ChevronRight, Upload, Plus, X, Video, UploadCloud, CheckCircle } from 'lucide-react'
import { ProposalCard } from '@/components/dashboard/proposal-card'
import { Proposal } from '@/types/proposal'
import { Order } from '@/types/order'
import DropZone from '@/app/utils/DropZone'
import { uploadFile } from '@/utils/fileupload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface PlanPrices {
  [key: string]: {
    [category: string]: number;
    Base: number;
    Bronce: number;
    Plata: number;
    Oro: number;
  }
}

const PLAN_PRICES: PlanPrices = {
  light_single: {
    Base: 330000,
    Bronce: 300000,
    Plata: 280000,
    Oro: 265000
  },
  light_double: {
    Base: 550000,
    Bronce: 490000,
    Plata: 465000,
    Oro: 440000
  },
  medium_single: {
    Base: 520000,
    Bronce: 465000,
    Plata: 440000,
    Oro: 420000
  },
  medium_double: {
    Base: 700000,
    Bronce: 630000,
    Plata: 595000,
    Oro: 560000
  },
  full_single: {
    Base: 830000,
    Bronce: 750000,
    Plata: 700000,
    Oro: 650000
  },
  full_double: {
    Base: 1240000,
    Bronce: 1115000,
    Plata: 1050000,
    Oro: 990000
  }
}

const PLAN_NAMES = {
  light_single: "Light 1 Maxilar (hasta 10)",
  light_double: "Light 2 Maxilares (hasta 20)",
  medium_single: "Medio 1 Maxilar (hasta 18)",
  medium_double: "Medio 2 Maxilares (hasta 36)",
  full_single: "Full 1 Maxilar (ilimitado hasta 2 años)",
  full_double: "Full 2 Maxilares (ilimitado hasta 2 años)"
}

export default function NewProposal({ orderId, onProposalCreated }: NewProposalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMessages, setUploadMessages] = useState<string[]>([])
  const router = useRouter()

  // Estados para el formulario - nombres actualizados según la interfaz
  const [details, setDetails] = useState('')
  const [duration, setDuration] = useState('')
  const [upper_aligners_count, setUpperAlignersCount] = useState('')
  const [lower_aligners_count, setLowerAlignersCount] = useState('')
  const [treatment_plan, setTreatmentPlan] = useState('light_single')
  const [price, setPrice] = useState('')
  const [comments, setComments] = useState('')
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [videos, setVideos] = useState<VideoCargado[]>([])

  // Agregar useEffect para cargar la orden
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const record = await pb.collection('orders').getOne(orderId, {
          expand: 'created_by',
          requestKey: null
        });
        setOrder(record as unknown as Order);
      } catch (error) {
        console.error('Error al cargar la orden:', error);
      }
    };
    fetchOrder();
  }, [orderId]);

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

  const isFieldRequired = (field: string) => {
    return !details || !duration || !upper_aligners_count || !lower_aligners_count || !price || !treatment_plan;
  }

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  }

  const getFieldError = (field: string) => {
    if (!touchedFields[field]) return null;
    if (!details && field === 'details') return 'Este campo es requerido';
    if (!duration && field === 'duration') return 'Este campo es requerido';
    if (!upper_aligners_count && field === 'upper_aligners_count') return 'Este campo es requerido';
    if (!lower_aligners_count && field === 'lower_aligners_count') return 'Este campo es requerido';
    if (!price && field === 'price') return 'Este campo es requerido';
    if (!treatment_plan && field === 'treatment_plan') return 'Este campo es requerido';
    return null;
  }

  const handleCreateProposal = async () => {
    if (!details || !duration || !upper_aligners_count || !lower_aligners_count || !price || !treatment_plan) {
      setError('Por favor, complete todos los campos requeridos.')
      return
    }

    setIsLoading(true)
    setError(null)
    setShowProgressDialog(true)
    setUploadProgress(0)
    setUploadMessages([])

    // Calcular total de archivos a subir
    const totalArchivos = 
      comparisons.reduce((acc, comp) => acc + (comp.before ? 1 : 0) + (comp.after ? 1 : 0), 0) +
      videos.length;
    
    let archivosSubidos = 0;

    const actualizarProgreso = () => {
      archivosSubidos++;
      setUploadProgress(Math.round((archivosSubidos / totalArchivos) * 100));
    };

    const uploadWithRetry = async (file, orderId, type, maxRetries = 2) => {
      setUploadMessages([`Subiendo archivos ( ${archivosSubidos + 1} de ${totalArchivos} ) ${file.name}`]);
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const result = await uploadFile(file, orderId, type);
          actualizarProgreso();
          return result;
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    };

    try {
      // Subir las imágenes de comparación secuencialmente
      const uploadedComparisons = [];
      const uploadedVideos = [];
      
      for (const comp of comparisons) {
        let beforeFile = null;
        let afterFile = null;
        
        if (comp.before) {
          beforeFile = await uploadWithRetry(
            comp.before.file, 
            orderId, 
            'comparisons'
          );
        }
        
        if (comp.after) {
          afterFile = await uploadWithRetry(
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
        const uploadedVideo = await uploadWithRetry(
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
      
      setShowProgressDialog(false)
      setShowSuccessDialog(true)
      
      setTimeout(() => {
        setShowSuccessDialog(false)
        router.push(`/dashboard/orders/${orderId}`)
      }, 3000)

    } catch (error) {
      console.error('Error al crear la propuesta:', error)
      setError('Hubo un error al crear la propuesta. Por favor, inténtelo de nuevo.')
      setShowProgressDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="w-full space-y-4">
          <div className="space-y-4 px-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="details">Detalles del Tratamiento *</Label>
                <Textarea 
                  id="details"
                  placeholder="Describe los detalles del tratamiento propuesto"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  onBlur={() => handleFieldBlur('details')}
                  className={getFieldError('details') ? 'border-red-500' : ''}
                />
                {getFieldError('details') && (
                  <p className="text-sm text-red-500">{getFieldError('details')}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment_plan">Plan de Tratamiento *</Label>
                  <select
                    id="treatment_plan"
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 ${getFieldError('treatment_plan') ? 'border-red-500' : ''}`}
                    value={treatment_plan}
                    onChange={(e) => {
                      setTreatmentPlan(e.target.value);
                      // Actualizar automáticamente el precio según el plan seleccionado
                      const userCategory = order?.expand?.created_by?.category || 'Base';
                      setPrice(PLAN_PRICES[e.target.value][userCategory].toString());
                    }}
                    onBlur={() => handleFieldBlur('treatment_plan')}
                  >
                    <option value="">Seleccione un plan</option>
                    {Object.entries(PLAN_NAMES).map(([value, name]) => {
                      const userCategory = order?.expand?.created_by?.category || 'Base';
                      const price = PLAN_PRICES[value][userCategory].toLocaleString('es-CL');
                      return (
                        <option key={value} value={value}>
                          {name} - ${price}
                        </option>
                      );
                    })}
                  </select>
                  {getFieldError('treatment_plan') && (
                    <p className="text-sm text-red-500">{getFieldError('treatment_plan')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración Estimada *</Label>
                  <Input 
                    id="duration"
                    placeholder="ej: 6 meses"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    onBlur={() => handleFieldBlur('duration')}
                    className={getFieldError('duration') ? 'border-red-500' : ''}
                  />
                  {getFieldError('duration') && (
                    <p className="text-sm text-red-500">{getFieldError('duration')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upper_aligners_count">Cantidad Maxilar Superior *</Label>
                  <Input 
                    id="upper_aligners_count"
                    type="number"
                    placeholder="ej: 12"
                    value={upper_aligners_count}
                    onChange={(e) => setUpperAlignersCount(e.target.value)}
                    onBlur={() => handleFieldBlur('upper_aligners_count')}
                    className={getFieldError('upper_aligners_count') ? 'border-red-500' : ''}
                  />
                  {getFieldError('upper_aligners_count') && (
                    <p className="text-sm text-red-500">{getFieldError('upper_aligners_count')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lower_aligners_count">Cantidad Mandíbula *</Label>
                  <Input 
                    id="lower_aligners_count"
                    type="number"
                    placeholder="ej: 12"
                    value={lower_aligners_count}
                    onChange={(e) => setLowerAlignersCount(e.target.value)}
                    onBlur={() => handleFieldBlur('lower_aligners_count')}
                    className={getFieldError('lower_aligners_count') ? 'border-red-500' : ''}
                  />
                  {getFieldError('lower_aligners_count') && (
                    <p className="text-sm text-red-500">{getFieldError('lower_aligners_count')}</p>
                  )}
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

              <div className="space-y-2">
                <Label htmlFor="price">Precio del Tratamiento *</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="Ingrese el precio"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => handleFieldBlur('price')}
                  className={getFieldError('price') ? 'border-red-500' : ''}
                />
                {getFieldError('price') && (
                  <p className="text-sm text-red-500">{getFieldError('price')}</p>
                )}
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
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              <span className="text-sm truncate">{video.name}</span>
                            </div>
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
          </div>

          <div className="flex justify-end px-1">
            <Button 
              onClick={handleCreateProposal} 
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Propuesta'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-blue-600" />
              Subiendo archivos...
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {uploadProgress}% completado
                </div>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-md text-sm">
                  {uploadMessages.length > 0 && (
                    <div className="text-gray-600">{uploadMessages[uploadMessages.length - 1]}</div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Propuesta Creada con Éxito
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              La propuesta ha sido creada y enviada correctamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 