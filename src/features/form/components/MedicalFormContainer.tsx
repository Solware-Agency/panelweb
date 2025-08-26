import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@shared/components/ui/button"
import { Form } from "@shared/components/ui/form"
import { useToast } from "@shared/hooks/use-toast"
import { formSchema, type FormValues } from "@features/form/lib/form-schema"
import { PatientDataSection } from "./PatientDataSection"
import { ServiceSection } from "./ServiceSection"
import { PaymentSection } from "./PaymentSection"
import { CommentsSection } from "./CommentsSection"
import { FilePlus2, Loader2, Trash2 } from "lucide-react"
import { useExchangeRate } from "@shared/hooks/useExchangeRate"
import { useResetForm } from "@shared/hooks/useResetForm"
import { insertMedicalRecord } from "@lib/supabase-service"
import { useUserProfile } from "@shared/hooks/useUserProfile"

const getInitialFormValues = (): FormValues => ({
fullName: "",
idNumber: "",
phone: "",
ageValue: 0,
ageUnit: "MESES" as const,
email: "",
examType: "",
origin: "",
treatingDoctor: "",
sampleType: "",
numberOfSamples: 1,
relationship: "",
branch: "",
registrationDate: new Date(),
totalAmount: 0.01, // Changed from 0 to 0.01 to comply with database constraint
payments: [{ method: "", amount: 0, reference: "" }],
comments: "",
})

export function MedicalFormContainer() {
const { toast } = useToast()
const { data: exchangeRate, isLoading: isLoadingRate } = useExchangeRate()
const [usdValue, setUsdValue] = useState("")
const [vesValue, setVesValue] = useState("")
const [vesInputValue, setVesInputValue] = useState("")
const [usdFromVes, setUsdFromVes] = useState("")
const [isSubmitted, setIsSubmitted] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

const form = useForm<FormValues>({
resolver: zodResolver(formSchema),
defaultValues: getInitialFormValues(),
mode: "onChange", // Validate on change instead of on blur
})

const { fields, append, remove } = useFieldArray({
control: form.control,
name: "payments",
})

// Memoize the form control to prevent unnecessary re-renders
const formControl = useMemo(() => form.control, [form.control])

// Sync VES with USD input - memoized to prevent unnecessary re-renders
useEffect(() => {
if (exchangeRate && usdValue) {
const usd = parseFloat(usdValue)
if (!isNaN(usd)) {
setVesValue((usd * exchangeRate).toFixed(2))
}
} else {
setVesValue("")
}
}, [usdValue, exchangeRate])

// Sync USD with VES input - memoized to prevent unnecessary re-renders
useEffect(() => {
if (exchangeRate && vesInputValue && exchangeRate > 0) {
const ves = parseFloat(vesInputValue)
if (!isNaN(ves)) {
setUsdFromVes((ves / exchangeRate).toFixed(2))
}
} else {
setUsdFromVes("")
}
}, [vesInputValue, exchangeRate])

useResetForm(form, getInitialFormValues, setUsdValue, setIsSubmitted, toast)

// Memoize the append handler to prevent unnecessary re-renders
const handleAppend = useCallback(() => {
append({ method: "", amount: 0, reference: "" })
}, [append])

// Memoize the submit handler to prevent unnecessary re-renders
const onSubmit = useCallback(
async (data: FormValues) => {
setIsSubmitting(true)

try {
console.log("Enviando datos del formulario:", data)
const { data: insertedRecord, error } = await insertMedicalRecord(data, exchangeRate)

if (error) {
console.error("Error al guardar en Supabase:", error)

if (error.code === "TABLE_NOT_EXISTS") {
toast({
title: " Tabla no encontrada",
description: "La tabla de registros m�dicos no existe. Contacta al administrador del sistema.",
variant: "destructive",
})
} else if (error.code === "TOTAL_AMOUNT_CONSTRAINT") {
toast({
title: " Error en el monto total",
description: error.message,
variant: "destructive",
})
} else if (error.code === "VALIDATION_ERROR") {
toast({
title: " Error de validaci�n",
description: error.message,
variant: "destructive",
})
} else {
toast({
title: "? Error al guardar",
description: "Hubo un problema al guardar el registro. Intenta nuevamente.",
variant: "destructive",
})
}
return
}

console.log("Registro guardado exitosamente:", insertedRecord)

// Show success message
toast({
title: " Registro guardado",
description: "El registro m�dico se ha guardado correctamente.",
})

// Reset form and show new record button
setIsSubmitted(true)
setUsdValue("")
setVesValue("")
setVesInputValue("")
setUsdFromVes("")

// Reset form to initial values
form.reset(getInitialFormValues())
} catch (error) {
console.error("Error inesperado:", error)
toast({
title: " Error inesperado",
description: "Ocurri� un error inesperado. Intenta nuevamente.",
variant: "destructive",
})
} finally {
setIsSubmitting(false)
}
},
[exchangeRate, form, toast, setUsdValue, setVesValue, setVesInputValue, setUsdFromVes]
)

// Memoize the clear form handler to prevent unnecessary re-renders
const handleClearForm = useCallback(() => {
form.reset(getInitialFormValues())
setUsdValue("")
setVesValue("")
setVesInputValue("")
setUsdFromVes("")
setIsSubmitted(false)
toast({
title: " Formulario Limpio",
description: "Todos los campos han sido reiniciados.",
})
}, [form, toast])

// Memoize the new record handler to prevent unnecessary re-renders
const handleNewRecord = useCallback(() => {
form.reset(getInitialFormValues())
setUsdValue("")
setVesValue("")
setVesInputValue("")
setUsdFromVes("")
setIsSubmitted(false)
toast({
title: " Nuevo Registro",
description: "Formulario listo para un nuevo registro.",
})
}, [form, toast])

// Listen for clear form events from parent components
useEffect(() => {
const handleClearFormEvent = () => {
handleClearForm()
}

window.addEventListener("clearForm", handleClearFormEvent)

return () => {
window.removeEventListener("clearForm", handleClearFormEvent)
}
}, [handleClearForm])

const inputStyles = "transition-transform duration-300 focus:border-primary focus:ring-primary"
const { profile } = useUserProfile()

return (
<>
{/* Bot�n sticky fuera del contenedor principal */}
<div className="hidden lg:block fixed top-4 right-4 z-50">
<Button
type="button"
onClick={handleClearForm}
variant="outline"
className="flex items-center gap-1 text-xs py-1 px-2 sm:py-1.5 sm:px-2.5 bg-background/95 backdrop-blur-sm border-2 hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl"
>
<Trash2 className="h-4 w-4" />
Limpiar
</Button>
</div>

<div className="">
<div className="flex justify-between mb-3 sm:mb-4 md:mb-6">
<div>
<div className="flex items-center justify-between">
<div>
								<h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Formulario de Registro</h2>
<div className="w-16 sm:w-24 h-1 bg-primary mt-2 rounded-full"></div>
</div>
</div>
<h3 className="text-sm text-primary font-semibold mt-2 sm:mt-3">Bienvenido, {profile?.display_name}</h3>
</div>
</div>
<Form {...form}>
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 md:space-y-6">
<PatientDataSection control={formControl} inputStyles={inputStyles} />
<ServiceSection control={formControl} inputStyles={inputStyles} />
<PaymentSection
control={formControl}
fields={fields}
append={fields.length < 4 ? handleAppend : undefined}
remove={remove}
inputStyles={inputStyles}
usdValue={usdValue}
setUsdValue={setUsdValue}
vesValue={vesValue}
vesInputValue={vesInputValue}
setVesInputValue={setVesInputValue}
usdFromVes={usdFromVes}
exchangeRate={exchangeRate}
isLoadingRate={isLoadingRate}
/>
<CommentsSection control={formControl} inputStyles={inputStyles} />
{isSubmitted ? (
<Button
type="button"
onClick={handleNewRecord}
className="w-full font-bold text-sm sm:text-base py-1.5 sm:py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white transition-transform duration-300 transform hover:-translate-y-1"
>
<FilePlus2 />
Nuevo Registro
</Button>
) : (
<Button
type="submit"
className="w-full font-bold text-sm sm:text-base py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-transform duration-300 transform hover:-translate-y-1"
disabled={isSubmitting}
>
{isSubmitting ? (
<>
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
Guardando...
</>
) : (
"Enviar"
)}
</Button>
)}
</form>
</Form>
</div>
</>
)
}

export default MedicalFormContainer
