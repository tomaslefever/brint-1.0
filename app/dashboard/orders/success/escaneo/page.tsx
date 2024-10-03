import { CheckCircle, Calendar, MapPin, Phone, Clock, Printer } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function ConfirmacionPedidoEscaneo() {
  // Datos de demostración para un pedido con escaneo programado
  const detallesPedido = {
    numeroPedido: "PED-24680",
    metodoEntregaModelo: "escaneo" as const,
    tratamientoMaxilarSuperior: "Alineación completa, Expansión (1.5mm)",
    tratamientoMandibula: "Alineación completa, Intrusión de dientes anteriores",
    citaEscaneo: {
      fecha: "05/10/2023",
      hora: "14:30",
      ubicacion: "Centro de Escaneo 3D Brackets",
      direccion: "Avenida Dental 456, Suite 200, Ciudad Orto, CO 67890",
      numeroContacto: "+34 555 123 456"
    },
    observaciones: "El paciente tiene una ligera mordida cruzada. Considerar refinamientos adicionales para las relaciones molares."
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <CardTitle>Pedido Confirmado</CardTitle>
        </div>
        <CardDescription>Su pedido de alineadores con escaneo programado ha sido realizado con éxito</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>Número de Pedido: {detallesPedido.numeroPedido}</AlertTitle>
          <AlertDescription>Por favor, guarde este número para sus registros</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalles del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Método de Entrega del Modelo:</p>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Escaneo Programado
              </p>
            </div>
            <div>
              <p className="font-medium">Fecha de Escaneo:</p>
              <p>{detallesPedido.citaEscaneo.fecha}</p>
            </div>
            <div>
              <p className="font-medium">Hora de Escaneo:</p>
              <p>{detallesPedido.citaEscaneo.hora}</p>
            </div>
            <div>
              <p className="font-medium">Tratamiento Maxilar Superior:</p>
              <p>{detallesPedido.tratamientoMaxilarSuperior}</p>
            </div>
            <div>
              <p className="font-medium">Tratamiento Mandíbula:</p>
              <p>{detallesPedido.tratamientoMandibula}</p>
            </div>
          </div>
          {detallesPedido.observaciones && (
            <div>
              <p className="font-medium">Observaciones:</p>
              <p>{detallesPedido.observaciones}</p>
            </div>
          )}
        </div>

        <Alert variant="default">
          <Calendar className="h-4 w-4" />
          <AlertTitle>Cita de Escaneo Programada</AlertTitle>
          <AlertDescription>
            Su cita para el escaneo 3D ha sido programada. Por favor, llegue 15 minutos antes de la hora de su cita.
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{detallesPedido.citaEscaneo.fecha} a las {detallesPedido.citaEscaneo.hora}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{detallesPedido.citaEscaneo.ubicacion}</span>
              </div>
              <div className="flex items-center">
                <span className="ml-6">{detallesPedido.citaEscaneo.direccion}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{detallesPedido.citaEscaneo.numeroContacto}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">Próximos Pasos:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Llegue al centro de escaneo 15 minutos antes de su cita programada.</li>
            <li>Traiga una forma de identificación y esta confirmación de pedido.</li>
            <li>Después de su escaneo, nuestro equipo comenzará a procesar su pedido de alineadores.</li>
            <li>Recibirá actualizaciones sobre el estado de su pedido por correo electrónico.</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Calendar className="mr-2 h-4 w-4" />
          Añadir al Calendario
        </Button>
        <Button variant="outline" className="w-full sm:w-auto">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Confirmación
        </Button>
        <Button className="w-full sm:w-auto">Volver al Panel</Button>
      </CardFooter>
    </Card>
  )
}