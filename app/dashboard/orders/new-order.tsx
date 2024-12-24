'use client'

import { useState, useCallback } from 'react'
import { CalendarIcon, Upload, Info, ChevronRight, ChevronLeft, X, Plus, UploadCloud, AlertCircle, Link, Terminal } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDropzone } from 'react-dropzone';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SelectClients from '@/components/dashboard/select-clients'
import SelectCompanies from '@/components/dashboard/select-companies'
import { Order } from '@/types/order'
import pb from '@/app/actions/pocketbase'
import { useRouter } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { createNotification } from '@/utils/notifications'
import { createActivity } from '@/utils/newactivity'
import { uploadFile } from '@/utils/fileupload'
import DropZone from '@/app/utils/DropZone'
import { toast } from '@/hooks/use-toast'

interface NewOrderProps {
  onOrderCreated: () => void;
  onFormChange?: (content: string) => void;
}

interface ImagenCargada {
  file: File;
  preview: string;
}

export default function NewOrder({ onOrderCreated }: NewOrderProps) {
  const [paso, setPaso] = useState(1)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const opcionesTratamiento = [
    { id: 'alineacionCompleta', etiqueta: 'Alineación Completa' },
    { id: 'alineacionParcial', etiqueta: 'Alineación Parcial (3 a 3)' },
    { id: 'nivelacion', etiqueta: 'Nivelación' },
    { id: 'stripping', etiqueta: 'Stripping entre dientes' },
    { id: 'expansion', etiqueta: 'Expansión' },
    { id: 'retroinclinacion', etiqueta: 'Retroinclinación o Retracción de dientes' },
    { id: 'proinclinacion', etiqueta: 'Proinclinación o Protracción de dientes' },
    { id: 'extrusion', etiqueta: 'Extrusión de dientes' },
    { id: 'intrusion', etiqueta: 'Intrusión de dientes' },
    { id: 'cerrarEspacio', etiqueta: 'Cerrar Espacio entre dientes' },
    { id: 'cerrarLineaMedia', etiqueta: 'Cerrar Línea Media' },
  ]

  const horasDisponibles = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  // Estados para el paso 3
  const [metodoEntregaModelo, setMetodoEntregaModelo] = useState('')
  const [opcionModeloFisico, setOpcionModeloFisico] = useState('')
  const [opcionModeloDigital, setOpcionModeloDigital] = useState('')
  const [fechaEscaneo, setFechaEscaneo] = useState<Date>()
  const [fechaRetiro, setFechaRetiro] = useState<Date>()
  const [horaRetiro, setHoraRetiro] = useState('')
  const [direccionRetiro, setDireccionRetiro] = useState('')
  const [comunaRetiro, setComunaRetiro] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [fotografias, setFotografias] = useState<{[key: string]: ImagenCargada | null}>({
    frontalSonrisa: null,
    lateralSonrisa: null,
    frontalReposo: null,
    lateralReposo: null,
  })
  const [fotografiasAdicionales, setFotografiasAdicionales] = useState<(ImagenCargada | null)[]>([])
  const [tipoImagenRadiologica, setTipoImagenRadiologica] = useState('')
  const [imagenesRadiologicas, setImagenesRadiologicas] = useState<{[key: string]: ImagenCargada | null}>({
    teleRxLateral: null,
    rxPanoramica: null,
    coneBeam: null
  })

  // Estados separados para valores y checkboxes
  const [maxilarSuperior, setMaxilarSuperior] = useState({
    alineacion: '',
    nivelacion: '',
    stripping: '',
    expansion: '',
    retroinclinacion: '',
    proinclinacion: '',
    extrusion: '',
    intrusion: '',
    'cerrar Espacio': '',
    'cerrar Linea Media': ''
  })

  const [maxilarSuperiorChecks, setMaxilarSuperiorChecks] = useState({
    nivelacion: false,
    stripping: false,
    expansion: false,
    retroinclinacion: false,
    proinclinacion: false,
    extrusion: false,
    intrusion: false,
    'cerrar Espacio': false,
    'cerrar Linea Media': false
  })

  const [mandibula, setMandibula] = useState({
    alineacion: '',
    nivelacion: '',
    stripping: '',
    expansion: '',
    retroinclinacion: '',
    proinclinacion: '',
    extrusion: '',
    intrusion: '',
    'cerrar Espacio': '',
    'cerrar Linea Media': ''
  })

  const [mandibulaChecks, setMandibulaChecks] = useState({
    nivelacion: false,
    stripping: false,
    expansion: false,
    retroinclinacion: false,
    proinclinacion: false,
    extrusion: false,
    intrusion: false,
    'cerrar Espacio': false,
    'cerrar Linea Media': false
  })

  const [activity, setActivity] = useState('')

  const manejarCambioArchivo = useCallback((files: FileList | File[] | null, tipo: string) => {
    if (files) {
      if (tipo === 'modelo3d') {
        const nuevosArchivos = Array.isArray(files) ? files : Array.from(files);
        setArchivos(prev => [...prev, ...nuevosArchivos]);
      } else if (tipo.startsWith('adicionales-')) {
        const index = parseInt(tipo.split('-')[1])
        const file = Array.isArray(files) ? files[0] : files[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setFotografiasAdicionales(prev => {
            const newFotos = [...prev];
            newFotos[index] = { file, preview };
            return newFotos;
          });
        }
      } else if (tipo in fotografias) {
        const file = Array.isArray(files) ? files[0] : files[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setFotografias(prev => ({
            ...prev,
            [tipo]: { file, preview }
          }));
        }
      } else if (tipo in imagenesRadiologicas) {
        const file = Array.isArray(files) ? files[0] : files[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setImagenesRadiologicas(prev => ({
            ...prev,
            [tipo]: { file, preview }
          }));
        }
      }
    }
  }, [fotografias, imagenesRadiologicas]);

  const eliminarImagen = useCallback((tipo: string, index?: number) => {
    if (tipo === 'adicionales' && typeof index === 'number') {
      setFotografiasAdicionales(prev => prev.filter((_, i) => i !== index))
    } else if (tipo in fotografias) {
      setFotografias(prev => ({ ...prev, [tipo]: null }))
    } else if (tipo in imagenesRadiologicas) {
      setImagenesRadiologicas(prev => ({ ...prev, [tipo]: null }))
    }
  }, [fotografias, imagenesRadiologicas])

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

  const handleMaxilarSuperiorChange = (field: string, value: string) => {
    setMaxilarSuperior(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMandibulaChange = (field: string, value: string) => {
    setMandibula(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Organización</Label>
        <SelectCompanies
          onCompanySelect={(companyId) => setSelectedCompanyId(companyId)}
          selectedCompanyId={selectedCompanyId}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cliente">Datos del paciente</Label>
        <SelectClients 
          onClientSelect={(clientId) => setSelectedCustomerId(clientId)}
          selectedClientId={selectedCustomerId}
        />
      </div>
    </div>
  )

  const renderPaso2 = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Maxilar Superior</h3>
          <RadioGroup value={maxilarSuperior.alineacion} onValueChange={(value) => handleMaxilarSuperiorChange('alineacion', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionCompleta" id="maxilarSuperiorAlineacionCompleta" />
              <Label htmlFor="maxilarSuperiorAlineacionCompleta">Alineación Completa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionParcial" id="maxilarSuperiorAlineacionParcial" />
              <Label htmlFor="maxilarSuperiorAlineacionParcial">Alineación Parcial (3 a 3)</Label>
            </div>
          </RadioGroup>
          {Object.entries(maxilarSuperior).slice(1).map(([key, value]) => (
            <div key={`maxilarSuperior${key}`} className="flex items-center space-x-2">
              <Checkbox 
                id={`maxilarSuperior${key}Checkbox`}
                checked={maxilarSuperiorChecks[key]}
                onCheckedChange={(checked) => setMaxilarSuperiorChecks(prev => ({
                  ...prev,
                  [key]: checked
                }))}
              />
              <div className="grid gap-1.5 leading-none flex-1">
                <Input 
                  className="h-8" 
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)} 
                  value={value}
                  onChange={(e) => handleMaxilarSuperiorChange(key, e.target.value)}
                  disabled={!maxilarSuperiorChecks[key]}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Mandíbula</h3>
          <RadioGroup value={mandibula.alineacion} onValueChange={(value) => handleMandibulaChange('alineacion', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionCompleta" id="mandibulaAlineacionCompleta" />
              <Label htmlFor="mandibulaAlineacionCompleta">Alineación Completa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionParcial" id="mandibulaAlineacionParcial" />
              <Label htmlFor="mandibulaAlineacionParcial">Alineación Parcial (3 a 3)</Label>
            </div>
          </RadioGroup>
          {Object.entries(mandibula).slice(1).map(([key, value]) => (
            <div key={`mandibula${key}`} className="flex items-center space-x-2">
              <Checkbox 
                id={`mandibula${key}Checkbox`}
                checked={mandibulaChecks[key]}
                onCheckedChange={(checked) => setMandibulaChecks(prev => ({
                  ...prev,
                  [key]: checked
                }))}
              />
              <div className="grid gap-1.5 leading-none flex-1">
                <Input 
                  className="h-8" 
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)} 
                  value={value}
                  onChange={(e) => handleMandibulaChange(key, e.target.value)}
                  disabled={!mandibulaChecks[key]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea 
          id="observaciones" 
          placeholder="Ingrese cualquier observación adicional aquí" 
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
      </div>
    </div>
  )

  const renderPaso3 = () => (
    <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger disabled>1. Método de Entrega del Modelo</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <Select value={metodoEntregaModelo} onValueChange={setMetodoEntregaModelo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el método de entrega del modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital (archivos STL)</SelectItem>
                <SelectItem value="radiologico">Imagen radiologica (archivo DICOM o DCM)</SelectItem>
                <SelectItem value="escaneo">Generar una orden de escaneo</SelectItem>
                {/* <SelectItem value="escaneo">Generar una orden de escaneo</SelectItem> */}
              </SelectContent>
            </Select>

            {metodoEntregaModelo === 'digital' && (
              <div className="space-y-4">
                <FileDropzone 
                  files={archivos}
                  onDrop={(acceptedFiles) => {
                    if (acceptedFiles.length > 0) {
                      setArchivos(prev => [...prev, ...acceptedFiles]);
                    }
                  }}
                  onDelete={(index) => {
                    setArchivos(prev => prev.filter((_, i) => i !== index));
                  }}
                  acceptedFileTypes={{
                    'model/stl': ['.stl'],
                    'application/octet-stream': ['.stl']
                  }}
                  fileTypeDescription="STL"
                />
              </div>
            )}

            {metodoEntregaModelo === 'radiologico' && (
              <div className="space-y-2">
                <FileDropzone 
                  files={archivos}
                  onDrop={(acceptedFiles) => {
                    if (acceptedFiles.length > 0) {
                      setArchivos(prev => [...prev, ...acceptedFiles]);
                    }
                  }}
                  onDelete={(index) => {
                    setArchivos(prev => prev.filter((_, i) => i !== index));
                  }}
                  acceptedFileTypes={{
                    'application/dicom': ['.dicom', '.dcm'],
                    'application/octet-stream': ['.dicom', '.dcm']
                  }}
                  fileTypeDescription="DICOM"
                />
              </div>
            )}

            {metodoEntregaModelo === 'escaneo' && (
              <div className="space-y-2">
                <Label>Fecha de Escaneo</Label>
                <Alert>
                  <CalendarIcon className="h-4 w-4" />
                  <AlertTitle>Agenda un escaneo</AlertTitle>
                  <AlertDescription className='flex justify-start flex-col'>
                    Debes agendar un escaneo en nuestro laboratorio para hacer un escaneo de tu paciente
                    <Button className='flex-none text-xs uppercase text-white bg-sky-500 border p-2 rounded-md'>Agendar escaneo</Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger disabled>2. Fotografías de paciente</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {['frontalSonrisa', 'lateralSonrisa', 'frontalReposo', 'lateralReposo'].map((tipo) => (
                <div key={tipo} className="space-y-2">
                  <Label className='text-xs capitalize' htmlFor={tipo}>{`${tipo.replace(/([A-Z])/g, ' $1')}`}</Label>
                  {fotografias[tipo] ? (
                    <ImagePreview imagen={fotografias[tipo]!} onDelete={() => eliminarImagen(tipo)} />
                  ) : (
                    <DropZone tipo={tipo} onFileChange={manejarCambioArchivo}>
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-xs">Arrastra o haz clic</p>
                      </div>
                    </DropZone>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {fotografiasAdicionales.map((foto, index) => (
                foto ? (
                  <ImagePreview key={index} imagen={foto} onDelete={() => eliminarImagen('adicionales', index)} />
                ) : (
                  <DropZone key={index} tipo={`adicionales-${index}`} onFileChange={manejarCambioArchivo}>
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-xs">Arrastra o haz clic</p>
                    </div>
                  </DropZone>
                )
              ))}
              {fotografiasAdicionales.length < 8 && (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors aspect-square flex items-center justify-center"
                  onClick={agregarNuevoDropZone}
                >
                  <div className="flex flex-col items-center">
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="text-xs">Agregar hasta {8 - fotografiasAdicionales.length} {8 - fotografiasAdicionales.length === 1 ? 'foto' : 'fotos'} más</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  const agregarNuevoDropZone = () => {
    setFotografiasAdicionales(prev => [...prev, null])
  }

  const eliminarArchivo = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomerId || !selectedCompanyId) {
      setError('Por favor, seleccione un cliente y una organización.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fotografías del paciente:', fotografias)
      console.log('Fotografías adicionales:', fotografiasAdicionales)
      console.log('Imágenes radiológicas:', imagenesRadiologicas)

      const orderData = {
        customer: selectedCustomerId,
        company: selectedCompanyId,
        maxilarSuperior,
        mandibula,
        metodoEntregaModelo,
        opcionModeloFisico,
        opcionModeloDigital,
        fechaEscaneo: fechaEscaneo?.toISOString(),
        fechaRetiro: fechaRetiro?.toISOString(),
        horaRetiro,
        direccionRetiro,
        comunaRetiro,
        tipoImagenRadiologica,
        created_by: pb.authStore.model?.id,
        status: 'pending',
      }

      const createdOrder = await pb.collection('orders').create(orderData)

      // Actualizar el campo 'orders' del paciente
      const customer = await pb.collection('customers').getOne(selectedCustomerId)
      const existingOrders = customer.orders?.length > 0 ? customer.orders : []
      await pb.collection('customers').update(selectedCustomerId, {
        orders: [...existingOrders, createdOrder.id]
      })

      // Crear comentario inicial
      if (activity) {
        const newActivity = await createActivity(createdOrder.id, activity);

        await pb.collection('orders').update(createdOrder.id, {
          activity: newActivity.id
        })
      } else {
        const newActivity = await createActivity(createdOrder.id, 'Pedido creado');

        await pb.collection('orders').update(createdOrder.id, {
          activity: newActivity.id
        })
      }

      // Subir múltiples archivos si existen
      if (archivos.length > 0) {
        const uploadedFileIds = await Promise.all(
          archivos.map(async (archivo) => {
            const uploadedFile = await uploadFile(archivo, createdOrder.id, 'model3d');
            return uploadedFile.id;
          })
        );

        await pb.collection('orders').update(createdOrder.id, {
          model3d: uploadedFileIds,
        });
      }

      // Subir fotografías
      for (const [key, imagen] of Object.entries(fotografias)) {
        if (imagen) {
          console.log(`Subiendo fotografía ${key}:`, imagen.file)
          const uploadedFile = await uploadFile(imagen.file, createdOrder.id, 'fotografiasPaciente');
          console.log(`Archivo subido para ${key}:`, uploadedFile)
          await pb.collection('orders').update(createdOrder.id, {
            [`fotografiasPaciente.${key}`]: uploadedFile.id,
          })
        }
      }

      // Subir fotografías adicionales
      for (let i = 0; i < fotografiasAdicionales.length; i++) {
        const foto = fotografiasAdicionales[i]
        if (foto) {
          console.log(`Subiendo fotografía adicional ${i}:`, foto.file)
          const uploadedFile = await uploadFile(foto.file, createdOrder.id, 'fotografiasAdicionales');
          console.log(`Archivo adicional subido ${i}:`, uploadedFile)
          await pb.collection('orders').update(createdOrder.id, {
            [`fotografiasAdicionales.${i}`]: uploadedFile.id,
          })
        }
      }

      // Subir imágenes radiológicas
      for (const [key, imagen] of Object.entries(imagenesRadiologicas)) {
        if (imagen) {
          console.log(`Subiendo imagen radiológica ${key}:`, imagen.file)
          const uploadedFile = await uploadFile(imagen.file, createdOrder.id, 'imagenesRadiologicas');
          console.log(`Archivo radiológico subido para ${key}:`, uploadedFile)
          await pb.collection('orders').update(createdOrder.id, {
            [`imagenesRadiologicas.${key}`]: uploadedFile.id,
          })
        }
      }

      const notification = await createNotification({
        userId: '',
        message: 'El usuario ' + pb.authStore.model?.name + ' ha creado una nueva orden',
        type: 'success',
        orderId: createdOrder.id
      })

      onOrderCreated()
      router.push('/dashboard/orders')
    } catch (error) {
      console.error('Error al crear el pedido:', error)
      setError('Hubo un error al crear el pedido. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const FileDropzone = ({ 
    files, 
    onDrop, 
    onDelete, 
    acceptedFileTypes,
    fileTypeDescription
  }) => {
    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
      onDrop: (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(file => {
            toast({
              title: "Se ha rechazado el archivo " + file.file.name,
              description: `Solo se permiten archivos ${fileTypeDescription}`,
              variant: "destructive",
            });
          });
        }
        
        onDrop(acceptedFiles);
      },
      accept: acceptedFileTypes,
      multiple: true,
      useFsAccessApi: false
    });

    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-4">
          {Array.isArray(files) && files.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-md">
                        <UploadCloud className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(index);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Agregar más archivos STL
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <UploadCloud className="h-12 w-12 text-gray-400" />
                {isDragActive ? (
                  <p className="text-sm text-gray-600">Suelta los archivos aquí...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      Arrastra archivos {fileTypeDescription} aquí o
                    </p>
                    <p className="text-xs uppercase text-gray-500 border p-2 rounded-md">
                      haz clic para seleccionar
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {fileRejections.length > 0 && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            Solo se permiten archivos STL. Los siguientes archivos fueron rechazados:
            <ul className="mt-1 list-disc list-inside">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.name}>
                  {file.name} - {errors.map(e => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <div className='text-xs text-muted-foreground'>
          Paso {paso} de 3 - {
            paso === 1 ? "Selección de cliente y organización" :
            paso === 2 ? "Detalles del alineador" :
            "Método de entrega y fotografías"
          }
        </div>
        <div className="flex">
          {paso > 1 && (
            <Button variant="outline" onClick={() => setPaso(paso - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
        <form>
          {paso === 1 ? renderPaso1() :
           paso === 2 ? renderPaso2() :
           renderPaso3()}
        </form>
      </div>
      <div className="flex justify-between px-1">
        {paso > 1 && (
          <Button variant="outline" onClick={() => setPaso(paso - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
        )}
        {paso < 3 ? (
          <Button 
            onClick={() => setPaso(paso + 1)} 
            className="ml-auto"
            disabled={paso === 1 && (!selectedCustomerId || !selectedCompanyId)}
          >
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="ml-auto" 
            onClick={handleCreateOrder} 
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Orden'}
          </Button>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  )
}
