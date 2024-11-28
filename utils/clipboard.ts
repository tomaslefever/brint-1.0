import { toast } from "@/hooks/use-toast"

export const copyToClipboard = async (text: string, title: string = "", successMessage: string = "") => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: title,
      description: successMessage,
      variant: "default",
    })
    return true
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err)
    toast({
      title: "Error",
      description: "No se pudo copiar al portapapeles",
      variant: "destructive",
      duration: 5000,
    })
    return false
  }
}
