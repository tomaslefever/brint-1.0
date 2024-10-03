import { CheckCircle, Truck, Printer } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrderConfirmation() {
  // Demo data
  const orderDetails = {
    orderNumber: "ORD-12345",
    modelDeliveryMethod: "physical" as const,
    upperJawTreatment: "Alineación Completa, Expansión (2mm)",
    lowerJawTreatment: "Alineación Parcial (3 a 3), Nivelación",
    scanDate: "2023-09-30",
    observations: "El paciente tiene una ligera sobremordida. Considerar refinamientos adicionales para la posición de los caninos."
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <CardTitle>Pedido Confirmado</CardTitle>
        </div>
        <CardDescription>Su pedido de alineadores ha sido realizado con éxito</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>Número de Pedido: {orderDetails.orderNumber}</AlertTitle>
          <AlertDescription>Por favor, mantenga este número para sus registros</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalles del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Método de Entrega del Modelo:</p>
              <p className="flex items-center">
                {orderDetails.modelDeliveryMethod === 'physical' ? (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    Modelo Físico
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Archivo Digital
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="font-medium">Tratamiento de la Mandíbula Superior:</p>
              <p>{orderDetails.upperJawTreatment}</p>
            </div>
            <div>
              <p className="font-medium">Tratamiento de la Mandíbula Inferior:</p>
              <p>{orderDetails.lowerJawTreatment}</p>
            </div>
          </div>
          {orderDetails.observations && (
            <div>
              <p className="font-medium">Observaciones:</p>
              <p>{orderDetails.observations}</p>
            </div>
          )}
        </div>

        {orderDetails.modelDeliveryMethod === 'physical' && (
          <Alert variant="default">
            <Truck className="h-4 w-4" />
            <AlertTitle>Instrucciones para el Modelo Físico</AlertTitle>
            <AlertDescription>
              Por favor, envíe su modelo físico junto con el número de pedido {orderDetails.orderNumber} a:
              <address className="mt-2 not-italic">
                Brackets 3D Printing Lab<br />
                123 Aligner Street<br />
                Dental City, DC 12345<br />
                Estados Unidos
              </address>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Próximos Pasos:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Nuestro equipo revisará su pedido y comenzará a procesarlo.</li>
            <li>Recibirá actualizaciones sobre el estado de su pedido por correo electrónico.</li>
            <li>Si necesitamos información adicional, nos pondremos en contacto con usted.</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Confirmación
        </Button>
        <Button className="w-full sm:w-auto">Regresar al Tablero</Button>
      </CardFooter>
    </Card>
  )
}