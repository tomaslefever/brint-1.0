import { CheckCircle, FileText, Printer, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function ConfirmacionPedidoDigital() {
  // Datos de demostración para un pedido con modelo digital
  const detallesPedido = {
    numeroPedido: "PED-67890",
    metodoEntregaModelo: "digital" as const,
    tratamientoMaxilarSuperior: "Alineación Completa, Intrusión de dientes anteriores",
    tratamientoMandibula: "Alineación Parcial (3 a 3), Expansión (1.5mm)",
    archivoSubido: {
      nombre: "modelo_paciente_v2.stl",
      tamaño: "15.7 MB",
      fechaSubida: "25/09/2023"
    },
    observaciones: "El paciente tiene apiñamiento leve en el arco inferior. Considerar reducción interproximal si es necesario."
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <CardTitle>Pedido Confirmado</CardTitle>
        </div>
        <CardDescription>Su pedido de alineador con modelo digital ha sido realizado con éxito</CardDescription>
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
                <FileText className="h-4 w-4 mr-2" />
                Modelo Digital
              </p>
            </div>
            <div>
              <p className="font-medium">Archivo Subido:</p>
              <p>{detallesPedido.archivoSubido.nombre}</p>
            </div>
            <div>
              <p className="font-medium">Tamaño del Archivo:</p>
              <p>{detallesPedido.archivoSubido.tamaño}</p>
            </div>
            <div>
              <p className="font-medium">Fecha de Subida:</p>
              <p>{detallesPedido.archivoSubido.fechaSubida}</p>
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
          <FileText className="h-4 w-4" />
          <AlertTitle>Modelo Digital Recibido</AlertTitle>
          <AlertDescription>
            Hemos recibido con éxito su modelo digital. Nuestro equipo revisará el archivo y comenzará a procesar su pedido.
            <div className="mt-2">
              <Badge variant="secondary" className="mr-2">Archivo: {detallesPedido.archivoSubido.nombre}</Badge>
              <Badge variant="secondary">Tamaño: {detallesPedido.archivoSubido.tamaño}</Badge>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">Próximos Pasos:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Nuestro equipo revisará su modelo digital subido y comenzará a procesar su pedido.</li>
            <li>Recibirá actualizaciones sobre el estado de su pedido por correo electrónico.</li>
            <li>Si necesitamos información adicional o ajustes en el modelo, nos pondremos en contacto con usted.</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Descargar Recibo
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