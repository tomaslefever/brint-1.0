'use client'

import { useState, useCallback } from 'react'
import { CalendarIcon, Upload, Info, ChevronRight, ChevronLeft, X, Plus, Trash2 } from 'lucide-react'
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
import Link from 'next/link'

interface ImagenCargada {
  file: File;
  preview: string;
}

export default function CrearPedido() {
  const [paso, setPaso] = useState(1)
  const [metodoEntregaModelo, setMetodoEntregaModelo] = useState('')
  const [opcionModeloFisico, setOpcionModeloFisico] = useState('')
  const [opcionModeloDigital, setOpcionModeloDigital] = useState('')
  const [fechaEscaneo, setFechaEscaneo] = useState<Date>()
  const [fechaRetiro, setFechaRetiro] = useState<Date>()
  const [horaRetiro, setHoraRetiro] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [fotografias, setFotografias] = useState<{[key: string]: ImagenCargada | null}>({
    frontalSonrisa: null,
    lateralSonrisa: null,
    lateralReposo: null,
  })
  const [fotografiasAdicionales, setFotografiasAdicionales] = useState<(ImagenCargada | null)[]>([])
  const [tipoImagenRadiologica, setTipoImagenRadiologica] = useState('')
  const [imagenesRadiologicas, setImagenesRadiologicas] = useState<{[key: string]: ImagenCargada | null}>({
    teleRxLateral: null,
    rxPanoramica: null,
    coneBeam: null
  })
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('')

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

  const pacientes = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María González' },
    { id: '3', nombre: 'Carlos Rodríguez' },
    // Añade más pacientes según sea necesario
  ]

  const manejarCambioArchivo = useCallback((files: FileList | null, tipo: string, index?: number) => {
    if (files && files[0]) {
      const file = files[0]
      if (tipo === 'modelo3d') {
        setArchivo(file)
      } else {
        const reader = new FileReader()

        reader.onloadend = () => {
          const imagenCargada: ImagenCargada = {
            file: file,
            preview: reader.result as string
          }

          if (tipo === 'adicionales') {
            setFotografiasAdicionales(prev => {
              const newFotos = [...prev]
              if (typeof index === 'number') {
                newFotos[index] = imagenCargada
              } else {
                newFotos.push(imagenCargada)
              }
              return newFotos
            })
          } else if (tipo in fotografias) {
            setFotografias(prev => ({ ...prev, [tipo]: imagenCargada }))
          } else if (tipo in imagenesRadiologicas) {
            setImagenesRadiologicas(prev => ({ ...prev, [tipo]: imagenCargada }))
          }
        }

        reader.readAsDataURL(file)
      }
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

  const agregarDropzone = () => {
    if (fotografiasAdicionales.length < 6) {
      setFotografiasAdicionales(prev => [...prev, null])
    }
  }

  const DropZone = ({ tipo, onFileChange, index, onDelete }: { tipo: string; onFileChange: (files: FileList | null) => void; index?: number; onDelete?: () => void }) => {
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onFileChange(e.dataTransfer.files)
    }

    return (
      <div className="relative">
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors aspect-square flex items-center justify-center"
        >
          <Input
            type="file"
            onChange={(e) => onFileChange(e.target.files)}
            accept="image/*"
            className="hidden"
            id={`file-input-${tipo}${index !== undefined ? `-${index}` : ''}`}
          />
          <label htmlFor={`file-input-${tipo}${index !== undefined ? `-${index}` : ''}`} className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 mb-2" />
              <p className="text-xs">Arrastra o haz clic</p>
            </div>
          </label>
        </div>
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  const ImagePreview = ({ imagen, onDelete }: { imagen: ImagenCargada; onDelete: () => void }) => (
    <div className="relative aspect-square">
      <img src={imagen.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Maxilar Superior</h3>
          <RadioGroup defaultValue="alineacionCompleta">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionCompleta" id="maxilarSuperiorAlineacionCompleta" />
              <Label htmlFor="maxilarSuperiorAlineacionCompleta">Alineación Completa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionParcial" id="maxilarSuperiorAlineacionParcial" />
              <Label htmlFor="maxilarSuperiorAlineacionParcial">Alineación Parcial (3 a 3)</Label>
            </div>
          </RadioGroup>
          {opcionesTratamiento.slice(2).map((opcion) => (
            <div key={`maxilarSuperior${opcion.id}`} className="flex items-start space-x-2">
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor={`maxilarSuperior${opcion.id}`}>{opcion.etiqueta}</Label>
                <Input className="h-8" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mandíbula</h3>
          <RadioGroup defaultValue="alineacionCompleta">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionCompleta" id="mandibulaAlineacionCompleta" />
              <Label htmlFor="mandibulaAlineacionCompleta">Alineación Completa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alineacionParcial" id="mandibulaAlineacionParcial" />
              <Label htmlFor="mandibulaAlineacionParcial">Alineación Parcial (3 a 3)</Label>
            </div>
          </RadioGroup>
          {opcionesTratamiento.slice(2).map((opcion) => (
            <div key={`mandibula${opcion.id}`} className="flex items-start space-x-2">
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor={`mandibula${opcion.id}`}>{opcion.etiqueta}</Label>
                <Input className="h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea id="observaciones" placeholder="Ingrese cualquier observación adicional aquí" />
      </div>
    </div>
  )

  const renderPaso2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. Método de Entrega del Modelo</h3>
        <Select onValueChange={setMetodoEntregaModelo}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el método de entrega del modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="digital">Digital (archivo)</SelectItem>
            <SelectItem value="fisico">Modelo físico (Yeso)</SelectItem>
            <SelectItem value="escaneo">Generar una orden de escaneo</SelectItem>
          </SelectContent>
        </Select>

        {metodoEntregaModelo === 'digital' && (
          <div className="space-y-4">
            <RadioGroup onValueChange={setOpcionModeloDigital} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="archivo" id="archivo" />
                <Label htmlFor="archivo">Archivo .stl</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3shape" id="3shape" />
                <Label htmlFor="3shape">Envío vía 3shape Communicate</Label>
              </div>
            </RadioGroup>

            {opcionModeloDigital === 'archivo' && (
              <div className="space-y-2">
                <Label htmlFor="subir-archivo">Subir Archivo de Modelo 3D</Label>
                <Input
                  type="file"
                  id="subir-archivo"
                  accept=".stl"
                  onChange={(e) => manejarCambioArchivo(e.target.files, 'modelo3d')}
                />
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
            <RadioGroup onValueChange={setOpcionModeloFisico} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retiro" id="retiro" />
                <Label htmlFor="retiro">Retiro a domicilio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="envio" id="envio" />
                <Label htmlFor="envio">Envío a nuestro laboratorio</Label>
              </div>
            </RadioGroup>

            {opcionModeloFisico === 'retiro' && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="direccion">Dirección de Retiro</Label>
                  <Input id="direccion" placeholder="Ingrese la dirección completa" />
                </div>
                <div>
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input id="comuna" placeholder="Ingrese la comuna" />
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Seleccionar Paciente</Label>
              <Select onValueChange={setPacienteSeleccionado}>
                <SelectTrigger id="paciente">
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Información sobre la cita de escaneo</AlertTitle>
              <AlertDescription>
                Se confirmará la hora de la cita de escaneo vía telefónica.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Fotografías de paciente</h3>
        <div className="grid grid-cols-3 gap-4">
          {['frontalSonrisa', 'lateralSonrisa', 'lateralReposo'].map((tipo) => (
            <div key={tipo} className="space-y-2">
              <Label htmlFor={tipo}>{`${tipo.replace(/([A-Z])/g, ' $1').toLowerCase()}`}</Label>
              {fotografias[tipo] ? (
                <ImagePreview imagen={fotografias[tipo]!} onDelete={() => eliminarImagen(tipo)} />
              ) : (
                <DropZone tipo={tipo} onFileChange={(files) => manejarCambioArchivo(files, tipo)} />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {fotografiasAdicionales.map((foto, index) => (
            <div key={index}>
              {foto ? (
                <ImagePreview imagen={foto} onDelete={() => eliminarImagen('adicionales', index)} />
              ) : (
                <DropZone
                  tipo="adicionales"
                  index={index}
                  onFileChange={(files) => manejarCambioArchivo(files, 'adicionales', index)}
                  onDelete={() => eliminarImagen('adicionales', index)}
                />
              )}
            </div>
          ))}
          {fotografiasAdicionales.length < 6 && (
            <Button
              variant="outline"
              type="button"
              className="h-full aspect-square flex flex-col items-center justify-center"
              onClick={agregarDropzone}
            >
              <Plus className="h-8 w-8 mb-2" />
              <span className="text-xs">Agregar foto</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Imágenes radiológicas para el estudio</h3>
        <RadioGroup onValueChange={setTipoImagenRadiologica}>
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
                  <DropZone tipo={tipo} onFileChange={(files) => manejarCambioArchivo(files, tipo)} />
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
                <DropZone tipo="coneBeam" onFileChange={(files) => manejarCambioArchivo(files, 'coneBeam')} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Pedido de Alineador - Paso {paso} de 2</CardTitle>
        <CardDescription>
          {paso === 1 ? "Complete los detalles del alineador" : "Método de entrega y fotografías"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          {paso === 1 ? renderPaso1() : renderPaso2()}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {paso > 1 && (
          <Button variant="outline" onClick={() => setPaso(paso - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
        )}
        {paso < 2 ? (
          <Button onClick={() => setPaso(paso + 1)} className="ml-auto">
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Link href={'/dashboard/orders/success/' + metodoEntregaModelo}><Button className="ml-auto">Crear Pedido</Button></Link>
        )}
      </CardFooter>
    </Card>
  )
}