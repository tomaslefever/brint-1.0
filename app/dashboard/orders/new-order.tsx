'use client'

import { useState, useCallback } from 'react'
import { CalendarIcon, Upload, Info, ChevronRight, ChevronLeft, X, Plus, UploadCloud } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
  const [archivo, setArchivo] = useState<File | null>(null)
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

  // Estados para el paso 2
  const [maxilarSuperior, setMaxilarSuperior] = useState({
    alineacion: '',
    'nivelacion': '',
    'stripping': '',
    'expansion': '',
    'retroinclinacion': '',
    'proinclinacion': '',
    'extrusion': '',
    'intrusion': '',
    'cerrar Espacio': '',
    'cerrar Linea Media': ''
  })

  const [mandibula, setMandibula] = useState({
    alineacion: '',
    'nivelacion': '',
    'stripping': '',
    'expansion': '',
    'retroinclinacion': '',
    'proinclinacion': '',
    'extrusion': '',
    'intrusion': '',
    'cerrar Espacio': '',
    'cerrar Linea Media': ''
  })

  const [activity, setActivity] = useState('')

  const manejarCambioArchivo = useCallback((files: FileList | null, tipo: string) => {
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()

      reader.onloadend = () => {
        const imagenCargada: ImagenCargada = {
          file: file,
          preview: reader.result as string
        }

        if (tipo.startsWith('adicionales-')) {
          const index = parseInt(tipo.split('-')[1])
          setFotografiasAdicionales(prev => {
            const newFotos = [...prev]
            newFotos[index] = imagenCargada
            return newFotos
          })
        } else if (tipo in fotografias) {
          setFotografias(prev => ({ ...prev, [tipo]: imagenCargada }))
        } else if (tipo in imagenesRadiologicas) {
          setImagenesRadiologicas(prev => ({ ...prev, [tipo]: imagenCargada }))
        } else if (tipo === 'modelo3d') {
          setArchivo(file)
        }
      }

      reader.readAsDataURL(file)
    }
  }, [fotografias, imagenesRadiologicas])

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
    setMaxilarSuperior(prev => ({ ...prev, [field]: value }))
  }

  const handleMandibulaChange = (field: string, value: string) => {
    setMandibula(prev => ({ ...prev, [field]: value }))
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
            <div key={`maxilarSuperior${key}`} className="flex items-start space-x-2">
              <div className="grid gap-1.5 leading-none">
                <Input 
                  className="h-8" 
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)} 
                  value={value}
                  onChange={(e) => handleMaxilarSuperiorChange(key, e.target.value)}
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
            <div key={`mandibula${key}`} className="flex items-start space-x-2">
              <div className="grid gap-1.5 leading-none">
                <Input 
                  className="h-8" 
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)} 
                  value={value}
                  onChange={(e) => handleMandibulaChange(key, e.target.value)}
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
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>1. Método de Entrega del Modelo</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <Select value={metodoEntregaModelo} onValueChange={setMetodoEntregaModelo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el método de entrega del modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital (archivo)</SelectItem>
                <SelectItem value="fisico">Modelo físico (Yeso)</SelectItem>
                {/* <SelectItem value="escaneo">Generar una orden de escaneo</SelectItem> */}
              </SelectContent>
            </Select>

            {metodoEntregaModelo === 'digital' && (
              <div className="space-y-4">
                <Label htmlFor="subir-archivo">Subir Archivo de Modelo 3D</Label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="relative">
                    <Input 
                      type="file" 
                      onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <div className="border rounded-md p-2 px-4 text-sm truncate flex gap-2 items-center hover:bg-slate-500">
                      <UploadCloud className='h-4 w-4' />
                      {archivo ? archivo.name : 'Seleccionar archivo'}
                    </div>
                  </div>
                </div>
                <RadioGroup value={opcionModeloDigital} onValueChange={setOpcionModeloDigital}>
                  <Alert className='bg-sky-50'>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instrucciones para envío vía 3shape Communicate</AlertTitle>
                    <AlertDescription>
                      Por favor enviar a cuenta communicate: digital@innova4d.cl
                    </AlertDescription>
                  </Alert>
                </RadioGroup>

                {opcionModeloDigital === 'archivo' && (
                  <div className="space-y-2">

                    {archivo && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Archivo seleccionado: {archivo.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {opcionModeloDigital === '3shape' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instrucciones para envío vía 3shape Communicate</AlertTitle>
                    <AlertDescription>
                      Por favor enviar a cuenta communicate: digital@innova4d.cl
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {metodoEntregaModelo === 'fisico' && (
              <div className="space-y-4">
                <RadioGroup value={opcionModeloFisico} onValueChange={setOpcionModeloFisico}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retiro" id="retiro" />
                    <Label htmlFor="retiro">Retiro a domicilio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="envio" id="envio" />
                    <Label htmlFor="envio">Envío a nuestro laboratorio</Label>
                  </div>
                </RadioGroup>

                {opcionModeloFisico === 'envio' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Envía el modelo a nuestro laboratorio</AlertTitle>
                    <AlertDescription>
                      Te enviaremos un correo con los detalles del envío. Debes asegurar que el modelo sea transportable y no se deforme.
                    </AlertDescription>
                  </Alert>
                )}

                {opcionModeloFisico === 'retiro' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="direccion">Dirección de Retiro</Label>
                      <Input id="direccion" placeholder="Ingrese la dirección completa" value={direccionRetiro} onChange={(e) => setDireccionRetiro(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="comuna">Comuna</Label>
                      <Input id="comuna" placeholder="Ingrese la comuna" value={comunaRetiro} onChange={(e) => setComunaRetiro(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Retiro</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fechaRetiro ? format(fechaRetiro, "PPP", { locale: es }) : <span>Seleccionar fecha de retiro</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fechaRetiro}
                            onSelect={setFechaRetiro}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Retiro</Label>
                      <Select onValueChange={setHoraRetiro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la hora de retiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {horasDisponibles.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {metodoEntregaModelo === 'escaneo' && (
              <div className="space-y-2">
                <Label>Fecha de Escaneo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaEscaneo ? format(fechaEscaneo, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaEscaneo}
                      onSelect={setFechaEscaneo}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>2. Fotografías de paciente</AccordionTrigger>
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

      <AccordionItem value="item-3">
        <AccordionTrigger>3. Imágenes radiológicas para el estudio</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <RadioGroup value={tipoImagenRadiologica} onValueChange={setTipoImagenRadiologica}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="imagenesRx" id="imagenesRx" />
                <Label htmlFor="imagenesRx">Imágenes RX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coneBeam" id="coneBeam" />
                <Label htmlFor="coneBeam">Cone beam (archivo .dicom o .dcm)</Label>
              </div>
            </RadioGroup>

            {tipoImagenRadiologica === 'imagenesRx' && (
              <div className="grid grid-cols-3 gap-4">
                {['teleRxLateral', 'rxPanoramica'].map((tipo) => (
                  <div key={tipo} className="space-y-2">
                    <Label htmlFor={tipo}>{tipo === 'teleRxLateral' ? 'Tele Rx Lateral' : 'Rx Panorámica'}</Label>
                    {imagenesRadiologicas[tipo] ? (
                      <ImagePreview imagen={imagenesRadiologicas[tipo]!} onDelete={() => eliminarImagen(tipo)} />
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
            )}

            {tipoImagenRadiologica === 'coneBeam' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coneBeamArchivo">Archivos .dicom o .dcm</Label>
                  {imagenesRadiologicas.coneBeam ? (
                    <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium truncate">{imagenesRadiologicas.coneBeam.file.name}</p>
                        <Button variant="destructive" size="sm" onClick={() => eliminarImagen('coneBeam')} className="mt-2">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <DropZone tipo="coneBeam" onFileChange={manejarCambioArchivo}>
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-xs">Arrastra o haz clic</p>
                      </div>
                    </DropZone>
                  )}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  const agregarNuevoDropZone = () => {
    setFotografiasAdicionales(prev => [...prev, null])
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

      // Subir archivos si existen
      if (archivo) {
        const uploadedFile = await uploadFile(archivo, createdOrder.id, 'model3d');
        // const formData = new FormData()
        // formData.append('file', archivo);
        // formData.append('order', createdOrder.id);
        // formData.append('owner', pb.authStore.model?.id);
        // const uploadedFile = await pb.collection('files').create(formData);
        await pb.collection('orders').update(createdOrder.id, {
          model3d: uploadedFile.id,
        })
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

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <div className='text-xs text-muted-foreground'>
          Paso {paso} de 3 - {
            paso === 1 ? "Selección de cliente y organización" :
            paso === 2 ? "Detalles del alineador" :
            "Método de entrega y fotografías"
          }
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
