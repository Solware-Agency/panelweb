import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, Save, Trash2, AlertCircle, User, DollarSign, FileText, 
  Cake, Mail, Phone, Calendar as CalendarIcon, Microscope, MapPin, Briefcase
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay, updateMedicalRecordWithLog, deleteMedicalRecord } from '@lib/supabase-service'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Calendar as DatePickerCalendar } from '@shared/components/ui/calendar'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { cn } from '@shared/lib/cn'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface UnifiedCaseModalProps {
  case_: MedicalRecord | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onDelete: () => void
}

interface Change {
  field: string
  fieldLabel: string
  oldValue: any
  newValue: any
}

// Validation schema for case editing
const caseEditSchema = z.object({
  // Patient information
  full_name: z.string().min(1, 'El nombre es requerido'),
  id_number: z.string().min(1, 'La cédula es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido').max(15, 'Máximo 15 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  date_of_birth: z.date().optional().nullable(),
  
  // Medical information
  exam_type: z.string().min(1, 'El tipo de examen es requerido'),
  origin: z.string().min(1, 'La procedencia es requerida'),
  treating_doctor: z.string().min(1, 'El médico tratante es requerido'),
  sample_type: z.string().min(1, 'El tipo de muestra es requerido'),
  number_of_samples: z.coerce.number().int().positive('El número debe ser positivo'),
  branch: z.string().min(1, 'La sede es requerida'),
  date: z.string().min(1, 'La fecha de registro es requerida'),
  
  // Biopsy information (optional)
  material_remitido: z.string().optional(),
  informacion_clinica: z.string().optional(),
  descripcion_macroscopica: z.string().optional(),
  diagnostico: z.string().optional(),
  comentario: z.string().optional(),
  
  // Payment information
  total_amount: z.coerce.number().min(0.01, 'El monto total debe ser mayor a cero'),
  payment_method_1: z.string().optional().nullable(),
  payment_amount_1: z.coerce.number().min(0).optional().nullable(),
  payment_reference_1: z.string().optional().nullable(),
  payment_method_2: z.string().optional().nullable(),
  payment_amount_2: z.coerce.number().min(0).optional().nullable(),
  payment_reference_2: z.string().optional().nullable(),
  payment_method_3: z.string().optional().nullable(),
  payment_amount_3: z.coerce.number().min(0).optional().nullable(),
  payment_reference_3: z.string().optional().nullable(),
  payment_method_4: z.string().optional().nullable(),
  payment_amount_4: z.coerce.number().min(0).optional().nullable(),
  payment_reference_4: z.string().optional().nullable(),
  
  // Additional information
  comments: z.string().optional().nullable(),
});

type CaseFormValues = z.infer<typeof caseEditSchema>;

const UnifiedCaseModal: React.FC<UnifiedCaseModalProps> = ({ 
  case_, 
  isOpen, 
  onClose, 
  onSave,
  onDelete
}) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isDateOfBirthOpen, setIsDateOfBirthOpen] = useState(false)
  const [isRegistrationDateOpen, setIsRegistrationDateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'patient' | 'medical' | 'payment' | 'additional'>('patient')

  // Initialize form with case data
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseEditSchema),
    defaultValues: {
      full_name: '',
      id_number: '',
      phone: '',
      email: null,
      date_of_birth: undefined,
      exam_type: '',
      origin: '',
      treating_doctor: '',
      sample_type: '',
      number_of_samples: 1,
      branch: '',
      date: '',
      material_remitido: '',
      informacion_clinica: '',
      descripcion_macroscopica: '',
      diagnostico: '',
      comentario: '',
      total_amount: 0,
      payment_method_1: null,
      payment_amount_1: null,
      payment_reference_1: null,
      payment_method_2: null,
      payment_amount_2: null,
      payment_reference_2: null,
      payment_method_3: null,
      payment_amount_3: null,
      payment_reference_3: null,
      payment_method_4: null,
      payment_amount_4: null,
      payment_reference_4: null,
      comments: null,
    }
  });

  // Reset form when case changes
  useEffect(() => {
    if (case_ && isOpen) {
      // Parse date_of_birth string to Date object if it exists
      let dateOfBirth = null;
      if (case_.date_of_birth) {
        try {
          dateOfBirth = parseISO(case_.date_of_birth);
        } catch (error) {
          console.error('Error parsing date of birth:', error);
        }
      }

      form.reset({
        full_name: case_.full_name || '',
        id_number: case_.id_number || '',
        phone: case_.phone || '',
        email: case_.email || null,
        date_of_birth: dateOfBirth,
        exam_type: case_.exam_type || '',
        origin: case_.origin || '',
        treating_doctor: case_.treating_doctor || '',
        sample_type: case_.sample_type || '',
        number_of_samples: case_.number_of_samples || 1,
        branch: case_.branch || '',
        date: case_.date || '',
        material_remitido: case_.material_remitido || '',
        informacion_clinica: case_.informacion_clinica || '',
        descripcion_macroscopica: case_.descripcion_macroscopica || '',
        diagnostico: case_.diagnostico || '',
        comentario: case_.comentario || '',
        total_amount: case_.total_amount || 0,
        payment_method_1: case_.payment_method_1 || null,
        payment_amount_1: case_.payment_amount_1 || null,
        payment_reference_1: case_.payment_reference_1 || null,
        payment_method_2: case_.payment_method_2 || null,
        payment_amount_2: case_.payment_amount_2 || null,
        payment_reference_2: case_.payment_reference_2 || null,
        payment_method_3: case_.payment_method_3 || null,
        payment_amount_3: case_.payment_amount_3 || null,
        payment_reference_3: case_.payment_reference_3 || null,
        payment_method_4: case_.payment_method_4 || null,
        payment_amount_4: case_.payment_amount_4 || null,
        payment_reference_4: case_.payment_reference_4 || null,
        comments: case_.comments || null,
      });
    }
  }, [case_, isOpen, form]);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      full_name: 'Nombre Completo',
      id_number: 'Cédula',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      date_of_birth: 'Fecha de Nacimiento',
      exam_type: 'Tipo de Examen',
      origin: 'Procedencia',
      treating_doctor: 'Médico Tratante',
      sample_type: 'Tipo de Muestra',
      number_of_samples: 'Cantidad de Muestras',
      branch: 'Sede',
      date: 'Fecha de Registro',
      material_remitido: 'Material Remitido',
      informacion_clinica: 'Información Clínica',
      descripcion_macroscopica: 'Descripción Macroscópica',
      diagnostico: 'Diagnóstico',
      comentario: 'Comentario',
      total_amount: 'Monto Total',
      payment_method_1: 'Método de Pago 1',
      payment_amount_1: 'Monto de Pago 1',
      payment_reference_1: 'Referencia de Pago 1',
      payment_method_2: 'Método de Pago 2',
      payment_amount_2: 'Monto de Pago 2',
      payment_reference_2: 'Referencia de Pago 2',
      payment_method_3: 'Método de Pago 3',
      payment_amount_3: 'Monto de Pago 3',
      payment_reference_3: 'Referencia de Pago 3',
      payment_method_4: 'Método de Pago 4',
      payment_amount_4: 'Monto de Pago 4',
      payment_reference_4: 'Referencia de Pago 4',
      comments: 'Comentarios',
    };
    return labels[field] || field;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Vacío';
    if (value instanceof Date) return format(value, 'dd/MM/yyyy', { locale: es });
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  const detectChanges = (formData: CaseFormValues): Change[] => {
    if (!case_) return [];

    const detectedChanges: Change[] = [];
    const fieldsToCheck = Object.keys(formData) as (keyof CaseFormValues)[];

    fieldsToCheck.forEach((field) => {
      let oldValue = case_[field as keyof MedicalRecord];
      let newValue = formData[field];

      // Special handling for date_of_birth
      if (field === 'date_of_birth') {
        // Convert string date to Date object for comparison
        if (case_.date_of_birth && newValue) {
          try {
            const oldDate = parseISO(case_.date_of_birth);
            // If dates are different, format them as strings for the change log
            if (oldDate.getTime() !== (newValue as Date).getTime()) {
              detectedChanges.push({
                field: field as string,
                fieldLabel: getFieldLabel(field as string),
                oldValue: format(oldDate, 'yyyy-MM-dd'),
                newValue: format(newValue as Date, 'yyyy-MM-dd'),
              });
            }
          } catch (error) {
            console.error('Error comparing dates:', error);
          }
        } else if ((!case_.date_of_birth && newValue) || (case_.date_of_birth && !newValue)) {
          // One is null and the other isn't
          detectedChanges.push({
            field: field as string,
            fieldLabel: getFieldLabel(field as string),
            oldValue: case_.date_of_birth || null,
            newValue: newValue ? format(newValue as Date, 'yyyy-MM-dd') : null,
          });
        }
        return; // Skip the rest of the comparison for date_of_birth
      }

      // Special handling for payment methods - convert undefined to null for comparison
      const normalizedOld = oldValue === null || oldValue === undefined || oldValue === '' ? null : oldValue;
      const normalizedNew = newValue === null || newValue === undefined || newValue === '' ? null : newValue;

      // Convert to strings for comparison, but keep original values for storage
      const oldStr = normalizedOld === null ? '' : String(normalizedOld);
      const newStr = normalizedNew === null ? '' : String(normalizedNew);

      if (oldStr !== newStr) {
        detectedChanges.push({
          field: field as string,
          fieldLabel: getFieldLabel(field as string),
          oldValue: normalizedOld,
          newValue: normalizedNew,
        });
      }
    });

    return detectedChanges;
  };

  const handleSubmit = async (formData: CaseFormValues) => {
    if (!case_ || !user) return;

    const detectedChanges = detectChanges(formData);

    if (detectedChanges.length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No se detectaron cambios para guardar.',
        variant: 'default',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare updates object
      const updates: Partial<MedicalRecord> = {};
      detectedChanges.forEach((change) => {
        // Special handling for date_of_birth to format as string
        if (change.field === 'date_of_birth' && change.newValue instanceof Date) {
          updates[change.field as keyof MedicalRecord] = format(change.newValue, 'yyyy-MM-dd') as any;
        } else if (
          typeof change.newValue === 'string' ||
          typeof change.newValue === 'number' ||
          change.newValue === null
        ) {
          updates[change.field as keyof MedicalRecord] = change.newValue as any;
        } else {
          updates[change.field as keyof MedicalRecord] = undefined;
        }
      });

      const { error } = await updateMedicalRecordWithLog(
        case_.id!,
        updates,
        detectedChanges,
        user.id,
        user.email || 'unknown@email.com'
      );

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Caso actualizado',
        description: `Se guardaron ${detectedChanges.length} cambio(s) exitosamente.`,
        className: 'bg-green-100 border-green-400 text-green-800',
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving case:', error);
      toast({
        title: '❌ Error al guardar',
        description: 'Hubo un problema al guardar los cambios. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!case_) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteMedicalRecord(case_.id!);

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Caso eliminado',
        description: 'El caso ha sido eliminado exitosamente.',
        className: 'bg-green-100 border-green-400 text-green-800',
      });

      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({
        title: '❌ Error al eliminar',
        description: 'Hubo un problema al eliminar el caso. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Get age display from date of birth
  const dateOfBirthValue = form.watch('date_of_birth');
  const ageDisplay = dateOfBirthValue
    ? getAgeDisplay(format(dateOfBirthValue, 'yyyy-MM-dd'))
    : case_?.date_of_birth
    ? getAgeDisplay(case_.date_of_birth)
    : '';

  if (!case_) return null;

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
            className="fixed inset-0 bg-black/50 z-[9999999999]"
          />

          {/* Main Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-[9999999999] p-4"
          >
            <div className="bg-white dark:bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Editar Caso</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {case_.code && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {case_.code}
                        </span>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {case_.full_name}
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

                {/* Tab Navigation */}
                <div className="flex space-x-2 mt-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('patient')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === 'patient'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Paciente
                  </button>
                  <button
                    onClick={() => setActiveTab('medical')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === 'medical'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Microscope className="w-4 h-4 inline mr-2" />
                    Médico
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === 'payment'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Pagos
                  </button>
                  <button
                    onClick={() => setActiveTab('additional')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === 'additional'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Adicional
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Patient Information Tab */}
                    {activeTab === 'patient' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <User className="text-blue-500 size-6" />
                          <h3 className="text-xl font-semibold">Información del Paciente</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre y Apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* ID Number */}
                          <FormField
                            control={form.control}
                            name="id_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cédula</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345678" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Phone */}
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-blue-500" />
                                  Teléfono
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="0412-1234567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email */}
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-blue-500" />
                                  Correo Electrónico
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Date of Birth */}
                          <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="flex items-center gap-2">
                                  <Cake className="w-4 h-4 text-pink-500" />
                                  Fecha de Nacimiento
                                </FormLabel>
                                <Popover open={isDateOfBirthOpen} onOpenChange={setIsDateOfBirthOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-full justify-start text-left font-normal',
                                          !field.value && 'text-muted-foreground'
                                        )}
                                      >
                                        <Cake className="mr-2 h-4 w-4 text-pink-500" />
                                        {field.value ? (
                                          <div className="flex items-center gap-2">
                                            <span>{format(field.value, 'PPP', { locale: es })}</span>
                                            {ageDisplay && (
                                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {ageDisplay}
                                              </span>
                                            )}
                                          </div>
                                        ) : case_.date_of_birth ? (
                                          <div className="flex items-center gap-2">
                                            <span>{format(parseISO(case_.date_of_birth), 'PPP', { locale: es })}</span>
                                            {ageDisplay && (
                                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {ageDisplay}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span>Sin fecha de nacimiento</span>
                                        )}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 z-[99999999999]">
                                    <DatePickerCalendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setIsDateOfBirthOpen(false);
                                      }}
                                      disabled={(date) => {
                                        const today = new Date();
                                        const maxAge = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate());
                                        return date > today || date < maxAge;
                                      }}
                                      initialFocus
                                      locale={es}
                                      defaultMonth={field.value || new Date(2000, 0, 1)}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Medical Information Tab */}
                    {activeTab === 'medical' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Microscope className="text-primary size-6" />
                          <h3 className="text-xl font-semibold">Información Médica</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Exam Type */}
                          <FormField
                            control={form.control}
                            name="exam_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Examen</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione tipo de examen" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="inmunohistoquimica">Inmunohistoquímica</SelectItem>
                                    <SelectItem value="biopsia">Biopsia</SelectItem>
                                    <SelectItem value="citologia">Citología</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Treating Doctor */}
                          <FormField
                            control={form.control}
                            name="treating_doctor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-green-500" />
                                  Médico Tratante
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre del médico" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Origin */}
                          <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Procedencia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Hospital o clínica" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Branch */}
                          <FormField
                            control={form.control}
                            name="branch"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-500" />
                                  Sede
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione una sede" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="PMG">PMG</SelectItem>
                                    <SelectItem value="CPC">CPC</SelectItem>
                                    <SelectItem value="CNX">CNX</SelectItem>
                                    <SelectItem value="STX">STX</SelectItem>
                                    <SelectItem value="MCY">MCY</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Sample Type */}
                          <FormField
                            control={form.control}
                            name="sample_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Muestra</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Biopsia de piel" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Number of Samples */}
                          <FormField
                            control={form.control}
                            name="number_of_samples"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cantidad de Muestras</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Registration Date */}
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                                  Fecha de Registro
                                </FormLabel>
                                <Popover open={isRegistrationDateOpen} onOpenChange={setIsRegistrationDateOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-full justify-start text-left font-normal',
                                          !field.value && 'text-muted-foreground'
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? (
                                          format(new Date(field.value), 'PPP', { locale: es })
                                        ) : (
                                          <span>Seleccione fecha</span>
                                        )}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 z-[99999999999]">
                                    <DatePickerCalendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          field.onChange(date.toISOString());
                                          setIsRegistrationDateOpen(false);
                                        }
                                      }}
                                      disabled={(date) => date > new Date()}
                                      initialFocus
                                      locale={es}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Biopsy Information (only for biopsy cases) */}
                        {form.watch('exam_type') === 'biopsia' && (
                          <div className="mt-6 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="text-green-500 size-6" />
                              <h3 className="text-xl font-semibold">Información de Biopsia</h3>
                            </div>

                            {/* Material Remitido */}
                            <FormField
                              control={form.control}
                              name="material_remitido"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Material Remitido</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describa el material remitido para análisis..."
                                      className="min-h-[80px]"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Información Clínica */}
                            <FormField
                              control={form.control}
                              name="informacion_clinica"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Información Clínica</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Información clínica relevante..."
                                      className="min-h-[80px]"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Descripción Macroscópica */}
                            <FormField
                              control={form.control}
                              name="descripcion_macroscopica"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción Macroscópica</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Descripción macroscópica de la muestra..."
                                      className="min-h-[100px]"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Diagnóstico */}
                            <FormField
                              control={form.control}
                              name="diagnostico"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Diagnóstico</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Diagnóstico basado en el análisis..."
                                      className="min-h-[100px]"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Comentario */}
                            <FormField
                              control={form.control}
                              name="comentario"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Comentario</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Comentarios adicionales (opcional)..."
                                      className="min-h-[80px]"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Information Tab */}
                    {activeTab === 'payment' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="text-purple-500 size-6" />
                          <h3 className="text-xl font-semibold">Información de Pago</h3>
                        </div>

                        {/* Total Amount */}
                        <FormField
                          control={form.control}
                          name="total_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto Total ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min="0.01"
                                  placeholder="0.00" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Payment Methods */}
                        <div className="space-y-6">
                          <h4 className="text-lg font-medium">Métodos de Pago</h4>

                          {/* Payment Method 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormField
                              control={form.control}
                              name="payment_method_1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Método de Pago 1</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                                    defaultValue={field.value || 'none'}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar método" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Sin método</SelectItem>
                                      <SelectItem value="Punto de venta">Punto de venta</SelectItem>
                                      <SelectItem value="Dólares en efectivo">Dólares en efectivo</SelectItem>
                                      <SelectItem value="Zelle">Zelle</SelectItem>
                                      <SelectItem value="Pago móvil">Pago móvil</SelectItem>
                                      <SelectItem value="Bs en efectivo">Bs en efectivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_amount_1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto 1</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value === null ? '' : field.value}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_reference_1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Referencia 1</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Referencia de pago" 
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Payment Method 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormField
                              control={form.control}
                              name="payment_method_2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Método de Pago 2</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                                    defaultValue={field.value || 'none'}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar método" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Sin método</SelectItem>
                                      <SelectItem value="Punto de venta">Punto de venta</SelectItem>
                                      <SelectItem value="Dólares en efectivo">Dólares en efectivo</SelectItem>
                                      <SelectItem value="Zelle">Zelle</SelectItem>
                                      <SelectItem value="Pago móvil">Pago móvil</SelectItem>
                                      <SelectItem value="Bs en efectivo">Bs en efectivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_amount_2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto 2</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value === null ? '' : field.value}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_reference_2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Referencia 2</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Referencia de pago" 
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Payment Method 3 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormField
                              control={form.control}
                              name="payment_method_3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Método de Pago 3</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                                    defaultValue={field.value || 'none'}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar método" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Sin método</SelectItem>
                                      <SelectItem value="Punto de venta">Punto de venta</SelectItem>
                                      <SelectItem value="Dólares en efectivo">Dólares en efectivo</SelectItem>
                                      <SelectItem value="Zelle">Zelle</SelectItem>
                                      <SelectItem value="Pago móvil">Pago móvil</SelectItem>
                                      <SelectItem value="Bs en efectivo">Bs en efectivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_amount_3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto 3</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value === null ? '' : field.value}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_reference_3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Referencia 3</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Referencia de pago" 
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Payment Method 4 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormField
                              control={form.control}
                              name="payment_method_4"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Método de Pago 4</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                                    defaultValue={field.value || 'none'}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar método" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Sin método</SelectItem>
                                      <SelectItem value="Punto de venta">Punto de venta</SelectItem>
                                      <SelectItem value="Dólares en efectivo">Dólares en efectivo</SelectItem>
                                      <SelectItem value="Zelle">Zelle</SelectItem>
                                      <SelectItem value="Pago móvil">Pago móvil</SelectItem>
                                      <SelectItem value="Bs en efectivo">Bs en efectivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_amount_4"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto 4</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00" 
                                      {...field}
                                      value={field.value === null ? '' : field.value}
                                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="payment_reference_4"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Referencia 4</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Referencia de pago" 
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Information Tab */}
                    {activeTab === 'additional' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="text-blue-500 size-6" />
                          <h3 className="text-xl font-semibold">Información Adicional</h3>
                        </div>

                        {/* Comments */}
                        <FormField
                          control={form.control}
                          name="comments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comentarios</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Comentarios adicionales..."
                                  className="min-h-[150px]"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Creation Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                          <h4 className="text-md font-medium mb-3">Información de Creación</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación:</p>
                              <p className="text-base">
                                {case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                              </p>
                            </div>
                            {case_.created_by_display_name && (
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Creado por:</p>
                                <p className="text-base">{case_.created_by_display_name}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delete Case Section */}
                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-red-800 dark:text-red-300 flex items-center gap-2 mb-2">
                              <Trash2 className="w-5 h-5" />
                              Eliminar Caso
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                              Esta acción eliminará permanentemente el caso y todos sus datos asociados. Esta acción no se puede deshacer.
                            </p>
                            <Button 
                              type="button"
                              variant="destructive" 
                              onClick={() => setIsConfirmDeleteOpen(true)}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Caso
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </div>

              {/* Footer with Action Buttons */}
              <div className="bg-white dark:bg-background border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky bottom-0 z-10">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button variant="outline" onClick={onClose} className="sm:order-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/80 sm:order-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="sm:order-0 sm:mr-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Caso
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Confirmation Delete Modal */}
          <AnimatePresence>
            {isConfirmDeleteOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[99999999999]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-[99999999999] p-4"
                >
                  <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ¿Estás seguro de que quieres eliminar el caso <strong>{case_.code || case_.id?.slice(-6).toUpperCase()}</strong> de <strong>{case_.full_name}</strong>?
                      </p>

                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          <strong>Advertencia:</strong> Esta acción no se puede deshacer. Todos los datos asociados a este caso serán eliminados permanentemente.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsConfirmDeleteOpen(false)}
                          className="flex-1"
                          disabled={isDeleting}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1"
                        >
                          {isDeleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default UnifiedCaseModal;