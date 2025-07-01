import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/button'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form'
import { Textarea } from '@shared/components/ui/textarea'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { updateMedicalRecordWithLog } from '@lib/supabase-service'
import type { MedicalRecord } from '@lib/supabase-service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAgeDisplay } from '@lib/supabase-service'

// Validation schema for biopsy case form
const biopsyCaseSchema = z.object({
  material_remitido: z.string().min(1, 'Este campo es requerido'),
  informacion_clinica: z.string().min(1, 'Este campo es requerido'),
  descripcion_macroscopica: z.string().min(1, 'Este campo es requerido'),
  diagnostico: z.string().min(1, 'Este campo es requerido'),
  comentario: z.string().optional(),
})

type BiopsyCaseFormData = z.infer<typeof biopsyCaseSchema>

const GenerateCasePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [caseData, setCaseData] = useState<MedicalRecord | null>(null)

  // Get case data from location state
  useEffect(() => {
    if (location.state?.case_) {
      setCaseData(location.state.case_)
    } else {
      // If no case data, redirect back to cases page
      navigate('/dashboard/cases')
      toast({
        title: '❌ Error',
        description: 'No se encontraron datos del caso. Vuelve a intentarlo.',
        variant: 'destructive',
      })
    }
  }, [location, navigate, toast])

  const form = useForm<BiopsyCaseFormData>({
    resolver: zodResolver(biopsyCaseSchema),
    defaultValues: {
      material_remitido: caseData?.material_remitido || '',
      informacion_clinica: caseData?.informacion_clinica || '',
      descripcion_macroscopica: caseData?.descripcion_macroscopica || '',
      diagnostico: caseData?.diagnostico || '',
      comentario: caseData?.comentario || '',
    },
  })

  // Reset form when case data changes
  useEffect(() => {
    if (caseData) {
      form.reset({
        material_remitido: caseData.material_remitido || '',
        informacion_clinica: caseData.informacion_clinica || '',
        descripcion_macroscopica: caseData.descripcion_macroscopica || '',
        diagnostico: caseData.diagnostico || '',
        comentario: caseData.comentario || '',
      })
    }
  }, [caseData, form])

  const handleSubmit = async (data: BiopsyCaseFormData) => {
    if (!caseData || !user) return

    setIsSaving(true)
    try {
      // Prepare changes for logging
      const changes = []
      
      if (data.material_remitido !== (caseData.material_remitido || '')) {
        changes.push({
          field: 'material_remitido',
          fieldLabel: 'Material Remitido',
          oldValue: caseData.material_remitido || null,
          newValue: data.material_remitido
        })
      }
      
      if (data.informacion_clinica !== (caseData.informacion_clinica || '')) {
        changes.push({
          field: 'informacion_clinica',
          fieldLabel: 'Información Clínica',
          oldValue: caseData.informacion_clinica || null,
          newValue: data.informacion_clinica
        })
      }
      
      if (data.descripcion_macroscopica !== (caseData.descripcion_macroscopica || '')) {
        changes.push({
          field: 'descripcion_macroscopica',
          fieldLabel: 'Descripción Macroscópica',
          oldValue: caseData.descripcion_macroscopica || null,
          newValue: data.descripcion_macroscopica
        })
      }
      
      if (data.diagnostico !== (caseData.diagnostico || '')) {
        changes.push({
          field: 'diagnostico',
          fieldLabel: 'Diagnóstico',
          oldValue: caseData.diagnostico || null,
          newValue: data.diagnostico
        })
      }
      
      if (data.comentario !== (caseData.comentario || '')) {
        changes.push({
          field: 'comentario',
          fieldLabel: 'Comentario',
          oldValue: caseData.comentario || null,
          newValue: data.comentario
        })
      }

      // If no changes, show message and return
      if (changes.length === 0) {
        toast({
          title: 'Sin cambios',
          description: 'No se detectaron cambios para guardar.',
          variant: 'default',
        })
        setIsSaving(false)
        return
      }

      // Update record with changes
      const { data: updatedRecord, error } = await updateMedicalRecordWithLog(
        caseData.id!,
        data,
        changes,
        user.id,
        user.email || 'unknown@email.com'
      )

      if (error) {
        throw error
      }

      toast({
        title: '✅ Caso generado exitosamente',
        description: `Se ha generado el caso de biopsia para ${caseData.full_name}.`,
        className: 'bg-green-100 border-green-400 text-green-800',
      })

      // Navigate back to cases page
      navigate('/dashboard/cases')
    } catch (error) {
      console.error('Error saving biopsy case:', error)
      toast({
        title: '❌ Error al guardar',
        description: 'Hubo un problema al generar el caso de biopsia. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoBack = () => {
    navigate('/dashboard/cases')
  }

  if (!caseData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Format date and get age display
  const formattedDate = caseData.date ? format(new Date(caseData.date), 'dd/MM/yyyy', { locale: es }) : 'N/A'
  const ageDisplay = caseData.date_of_birth ? getAgeDisplay(caseData.date_of_birth) : 'N/A'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Página de Generar Caso</h1>
        </div>
      </div>

      {/* Patient Information Header - Exact layout as in screenshot */}
      <div className="bg-black text-white p-6 mb-6 font-mono">
        <div className="grid grid-cols-2 gap-y-2">
          <div className="flex">
            <div className="w-32">NOMBRE:</div>
            <div className="flex-1">{caseData.full_name}</div>
          </div>
          <div className="flex">
            <div className="w-32">FECHA:</div>
            <div className="flex-1">{formattedDate}</div>
          </div>
          
          <div className="flex">
            <div className="w-32">EDAD:</div>
            <div className="flex-1">{ageDisplay}</div>
          </div>
          <div className="flex">
            <div className="w-32">INFORME N.º:</div>
            <div className="flex-1">{caseData.code || 'N/A'}</div>
          </div>
          
          <div className="flex">
            <div className="w-32">CI / HISTORIA:</div>
            <div className="flex-1">{caseData.id_number}</div>
          </div>
          <div className="col-span-1"></div>
          
          <div className="flex">
            <div className="w-32">DOCTOR(A):</div>
            <div className="flex-1">{caseData.treating_doctor}</div>
          </div>
          <div className="col-span-1"></div>
          
          <div className="flex">
            <div className="w-32">PROCEDENCIA:</div>
            <div className="flex-1">{caseData.origin}</div>
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Horizontal separator */}
      <div className="border-b border-gray-300 dark:border-gray-700 mb-6"></div>

      {/* Biopsy Case Form */}
      <div className="bg-white dark:bg-background rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="material_remitido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Material Remitido *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el material remitido para análisis..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="informacion_clinica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Información Clínica *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información clínica relevante..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion_macroscopica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Descripción Macroscópica *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción macroscópica de la muestra..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnostico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Diagnóstico *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Diagnóstico basado en el análisis..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comentario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Comentario</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Comentarios adicionales (opcional)..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleGoBack}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/80"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default GenerateCasePage