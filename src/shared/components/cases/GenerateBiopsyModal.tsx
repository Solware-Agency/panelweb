import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, FileText, Microscope, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form'
import { Button } from '@shared/components/ui/button'
import { Textarea } from '@shared/components/ui/textarea'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { updateMedicalRecordWithLog } from '@lib/supabase-service'
import type { MedicalRecord } from '@lib/supabase-service'

// Validation schema for biopsy case form
const biopsyCaseSchema = z.object({
  material_remitido: z.string().min(1, 'Este campo es requerido'),
  informacion_clinica: z.string().min(1, 'Este campo es requerido'),
  descripcion_macroscopica: z.string().min(1, 'Este campo es requerido'),
  diagnostico: z.string().min(1, 'Este campo es requerido'),
  comentario: z.string().optional(),
})

type BiopsyCaseFormData = z.infer<typeof biopsyCaseSchema>

interface GenerateBiopsyModalProps {
  case_: MedicalRecord | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const GenerateBiopsyModal: React.FC<GenerateBiopsyModalProps> = ({ 
  case_, 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<BiopsyCaseFormData>({
    resolver: zodResolver(biopsyCaseSchema),
    defaultValues: {
      material_remitido: case_?.material_remitido || '',
      informacion_clinica: case_?.informacion_clinica || '',
      descripcion_macroscopica: case_?.descripcion_macroscopica || '',
      diagnostico: case_?.diagnostico || '',
      comentario: case_?.comentario || '',
    },
  })

  // Reset form when case changes
  React.useEffect(() => {
    if (case_ && isOpen) {
      form.reset({
        material_remitido: case_.material_remitido || '',
        informacion_clinica: case_.informacion_clinica || '',
        descripcion_macroscopica: case_.descripcion_macroscopica || '',
        diagnostico: case_.diagnostico || '',
        comentario: case_.comentario || '',
      })
    }
  }, [case_, isOpen, form])

  const handleSubmit = async (data: BiopsyCaseFormData) => {
    if (!case_ || !user) return

    setIsSaving(true)
    try {
      // Prepare changes for logging
      const changes = []
      
      if (data.material_remitido !== (case_.material_remitido || '')) {
        changes.push({
          field: 'material_remitido',
          fieldLabel: 'Material Remitido',
          oldValue: case_.material_remitido || null,
          newValue: data.material_remitido
        })
      }
      
      if (data.informacion_clinica !== (case_.informacion_clinica || '')) {
        changes.push({
          field: 'informacion_clinica',
          fieldLabel: 'Información Clínica',
          oldValue: case_.informacion_clinica || null,
          newValue: data.informacion_clinica
        })
      }
      
      if (data.descripcion_macroscopica !== (case_.descripcion_macroscopica || '')) {
        changes.push({
          field: 'descripcion_macroscopica',
          fieldLabel: 'Descripción Macroscópica',
          oldValue: case_.descripcion_macroscopica || null,
          newValue: data.descripcion_macroscopica
        })
      }
      
      if (data.diagnostico !== (case_.diagnostico || '')) {
        changes.push({
          field: 'diagnostico',
          fieldLabel: 'Diagnóstico',
          oldValue: case_.diagnostico || null,
          newValue: data.diagnostico
        })
      }
      
      if (data.comentario !== (case_.comentario || '')) {
        changes.push({
          field: 'comentario',
          fieldLabel: 'Comentario',
          oldValue: case_.comentario || null,
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
      const { error } = await updateMedicalRecordWithLog(
        case_.id!,
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
        description: `Se ha generado el caso de biopsia para ${case_.full_name}.`,
        className: 'bg-green-100 border-green-400 text-green-800',
      })

      onSuccess()
      onClose()
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

  if (!case_) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[999999998]"
          />

          {/* Main Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-background shadow-2xl z-[999999999] overflow-y-auto border-l border-input"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Generar Caso de Biopsia</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {case_.code || case_.id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • {case_.full_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Material Remitido */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información del Caso</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="material_remitido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Remitido *</FormLabel>
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
                          <FormLabel>Información Clínica *</FormLabel>
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
                          <FormLabel>Descripción Macroscópica *</FormLabel>
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
                          <FormLabel>Diagnóstico *</FormLabel>
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
                          <FormLabel>Comentario</FormLabel>
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary hover:bg-primary/80"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Generar Caso
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GenerateBiopsyModal