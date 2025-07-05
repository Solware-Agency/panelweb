import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  X, Save, Trash2, AlertCircle, Loader2, User, DollarSign, 
  FileText, Cake, Mail, Phone, Microscope, CheckCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MedicalRecord } from '@lib/supabase-service'
import { updateMedicalRecordWithLog, deleteMedicalRecord, getAgeDisplay } from '@lib/supabase-service'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Calendar } from '@shared/components/ui/calendar'
import { useToast } from '@shared/hooks/use-toast'
import { cn } from '@shared/lib/cn'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'

// Validation schema for editing
const editCaseSchema = z.object({
  // Patient Information
  full_name: z.string().min(1, 'El nombre es requerido'),
  id_number: z.string().min(1, 'La cédula es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido').max(15, 'Máximo 15 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  date_of_birth: z.date().optional().nullable(),
  
  // Payment Information
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
  
  // Additional Information
  comments: z.string().optional().nullable(),
  
  // Medical Information (for biopsy cases)
  material_remitido: z.string().optional().nullable(),
  informacion_clinica: z.string().optional().nullable(),
  descripcion_macroscopica: z.string().optional().nullable(),
  diagnostico: z.string().optional().nullable(),
  comentario: z.string().optional().nullable(),
});

type EditCaseFormData = z.infer<typeof editCaseSchema>;

interface Change {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

const paymentMethods = ['Punto de venta', 'Dólares en efectivo', 'Zelle', 'Pago móvil', 'Bs en efectivo'];

interface UnifiedCaseModalProps {
  case_: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

const UnifiedCaseModal: React.FC<UnifiedCaseModalProps> = ({ 
  case_, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [changes, setChanges] = useState<Change[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDateOfBirthOpen, setIsDateOfBirthOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Determine if user can edit or delete cases based on role
  const canEdit = profile?.role === 'owner' || profile?.role === 'employee';
  const canDelete = profile?.role === 'owner' || profile?.role === 'employee';

  const form = useForm<EditCaseFormData>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      full_name: '',
      id_number: '',
      phone: '',
      email: null,
      date_of_birth: null,
      comments: '',
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
      material_remitido: null,
      informacion_clinica: null,
      descripcion_macroscopica: null,
      diagnostico: null,
      comentario: null,
    },
  });

  // Reset form when case changes or when switching between view/edit modes
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
        comments: case_.comments || '',
        payment_method_1: case_.payment_method_1 || null,
        payment_amount_1: case_.payment_amount_1,
        payment_reference_1: case_.payment_reference_1 || null,
        payment_method_2: case_.payment_method_2 || null,
        payment_amount_2: case_.payment_amount_2,
        payment_reference_2: case_.payment_reference_2 || null,
        payment_method_3: case_.payment_method_3 || null,
        payment_amount_3: case_.payment_amount_3,
        payment_reference_3: case_.payment_reference_3 || null,
        payment_method_4: case_.payment_method_4 || null,
        payment_amount_4: case_.payment_amount_4,
        payment_reference_4: case_.payment_reference_4 || null,
        material_remitido: case_.material_remitido || null,
        informacion_clinica: case_.informacion_clinica || null,
        descripcion_macroscopica: case_.descripcion_macroscopica || null,
        diagnostico: case_.diagnostico || null,
        comentario: case_.comentario || null,
      });
    }
  }, [case_, isOpen, form, isEditing]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      full_name: 'Nombre Completo',
      id_number: 'Cédula',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      date_of_birth: 'Fecha de Nacimiento',
      comments: 'Comentarios',
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
      material_remitido: 'Material Remitido',
      informacion_clinica: 'Información Clínica',
      descripcion_macroscopica: 'Descripción Macroscópica',
      diagnostico: 'Diagnóstico',
      comentario: 'Comentario',
    };
    return labels[field] || field;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Vacío';
    if (value instanceof Date) return format(value, 'dd/MM/yyyy', { locale: es });
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  const detectChanges = (formData: EditCaseFormData): Change[] => {
    if (!case_) return [];

    const detectedChanges: Change[] = [];
    const fieldsToCheck = Object.keys(formData) as (keyof EditCaseFormData)[];

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
                field,
                fieldLabel: getFieldLabel(field),
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
            field,
            fieldLabel: getFieldLabel(field),
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
          field,
          fieldLabel: getFieldLabel(field),
          oldValue: normalizedOld,
          newValue: normalizedNew,
        });
      }
    });

    return detectedChanges;
  };

  const handleSubmit = (formData: EditCaseFormData) => {
    // Validate: don't allow saving if total payment amount exceeds total case amount
    const exchangeRate = case_?.exchange_rate || 0;
    const bolivaresMethods = ['Punto de venta', 'Pago móvil', 'Bs en efectivo'];
    let totalPagosUSD = 0;
    
    for (let i = 1; i <= 4; i++) {
      const method = formData[`payment_method_${i}` as keyof EditCaseFormData] as string | undefined;
      let amountRaw = formData[`payment_amount_${i}` as keyof EditCaseFormData];
      let amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw));
      
      if (!method || isNaN(amount) || typeof amount !== 'number') continue;
      
      if (bolivaresMethods.includes(method)) {
        if (exchangeRate > 0) {
          totalPagosUSD += amount / exchangeRate;
        }
      } else {
        totalPagosUSD += amount;
      }
    }
    
    const montoTotal = case_?.total_amount || 0;
    if (totalPagosUSD > montoTotal + 0.01) {
      toast({
        title: 'Error en pagos',
        description: 'La suma de los pagos (convertidos a USD) excede el monto total del caso. Corrige los montos antes de guardar.',
        variant: 'destructive',
      });
      return;
    }

    const detectedChanges = detectChanges(formData);

    if (detectedChanges.length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No se detectaron cambios para guardar.',
        variant: 'default',
      });
      setIsEditing(false);
      return;
    }

    setChanges(detectedChanges);
    setIsConfirmSaveOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!case_ || !user) return;

    setIsSaving(true);
    try {
      // Prepare updates object
      const updates: Partial<MedicalRecord> = {};
      changes.forEach((change) => {
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
        changes,
        user.id,
        user.email || 'unknown@email.com',
      );

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Caso actualizado',
        description: `Se guardaron ${changes.length} cambio(s) exitosamente.`,
        className: 'bg-green-100 border-green-400 text-green-800',
      });

      setIsConfirmSaveOpen(false);
      setIsEditing(false);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
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
    if (!case_ || !user) return;

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

      if (onDelete) onDelete();
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

  // Get status color for payment status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };

  if (!case_) return null;

  // Format date for display
  const formattedDate = case_.date ? format(new Date(case_.date), 'dd/MM/yyyy', { locale: es }) : 'N/A';

  // Get age display from date of birth
  const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : '';

  // Format date of birth for display
  const formattedDateOfBirth = case_.date_of_birth
    ? format(parseISO(case_.date_of_birth), 'dd/MM/yyyy', { locale: es })
    : 'N/A';

  // Check if this is a biopsy case
  const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isEditing) {
                onClose();
              }
            }}
            className="fixed inset-0 bg-black/50 z-[99999998]"
          />

          {/* Main Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-[99999999] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-input">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {isEditing ? 'Editar Caso' : 'Detalles del Caso'}
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                      {case_.code && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {case_.code}
                        </span>
                      )}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          case_.payment_status,
                        )}`}
                      >
                        {case_.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && canEdit && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 sm:p-6 space-y-6">
                    {/* Patient Information Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información del Paciente</h3>
                      </div>
                      <div className="space-y-4">
                        {/* Full Name */}
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre y Apellido" {...field} className="focus:border-primary focus:ring-primary" />
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
                                <Input placeholder="12345678" {...field} className="focus:border-primary focus:ring-primary" />
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
                                <Input placeholder="0412-1234567" {...field} className="focus:border-primary focus:ring-primary" />
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
                                  className="focus:border-primary focus:ring-primary"
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
                                        !field.value && 'text-muted-foreground',
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
                                <PopoverContent className="w-auto p-0 z-[9999999]">
                                  <Calendar
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

                    {/* Medical Information Section (for biopsy cases) */}
                    {isBiopsyCase && (
                      <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                        <div className="flex items-center gap-2 mb-3">
                          <Microscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información Médica</h3>
                        </div>
                        <div className="space-y-4">
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
                                    className="min-h-[60px] resize-y"
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
                                    className="min-h-[60px] resize-y"
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
                                    className="min-h-[80px] resize-y"
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
                                    className="min-h-[80px] resize-y"
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
                                    className="min-h-[60px] resize-y"
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
                    )}

                    {/* Payment Methods Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Métodos de Pago</h3>
                      </div>
                      <div className="space-y-4">
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
                                  value={field.value || 'none'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="z-[9999999]">
                                    <SelectItem value="none">Sin método</SelectItem>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method} value={method}>
                                        {method}
                                      </SelectItem>
                                    ))}
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
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value === '' ? null : parseFloat(value));
                                    }}
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
                                  <Input placeholder="Referencia de pago" {...field} value={field.value || ''} />
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
                                  value={field.value || 'none'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="z-[9999999]">
                                    <SelectItem value="none">Sin método</SelectItem>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method} value={method}>
                                        {method}
                                      </SelectItem>
                                    ))}
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
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value === '' ? null : parseFloat(value));
                                    }}
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
                                  <Input placeholder="Referencia de pago" {...field} value={field.value || ''} />
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
                                  value={field.value || 'none'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="z-[9999999]">
                                    <SelectItem value="none">Sin método</SelectItem>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method} value={method}>
                                        {method}
                                      </SelectItem>
                                    ))}
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
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value === '' ? null : parseFloat(value));
                                    }}
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
                                  <Input placeholder="Referencia de pago" {...field} value={field.value || ''} />
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
                                  value={field.value || 'none'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="z-[9999999]">
                                    <SelectItem value="none">Sin método</SelectItem>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method} value={method}>
                                        {method}
                                      </SelectItem>
                                    ))}
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
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value === '' ? null : parseFloat(value));
                                    }}
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
                                  <Input placeholder="Referencia de pago" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comentarios</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comentarios del caso</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Agregar comentarios adicionales..." 
                                className="min-h-[100px]" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/80"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Patient Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <User className="text-blue-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información del Paciente</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nombre completo:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Cédula:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.id_number}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Fecha de nacimiento:</p>
                          <p className="text-sm sm:text-base font-medium">
                            {formattedDateOfBirth}
                            {ageDisplay && <span className="ml-2 text-xs sm:text-sm text-blue-600">({ageDisplay})</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Teléfono:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.phone}</p>
                        </div>
                      </div>
                      {case_.email && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email:</p>
                          <p className="text-sm sm:text-base font-medium break-words">{case_.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <Microscope className="text-primary size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información Médica</h3>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Exam Type */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Estudio:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.exam_type}</p>
                        </div>

                        {/* Treating Doctor */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Médico tratante:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.treating_doctor}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Origin */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Procedencia:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.origin}</p>
                        </div>

                        {/* Branch */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Sede:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.branch}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Sample Type */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Muestra:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.sample_type}</p>
                        </div>

                        {/* Number of Samples */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Cantidad de muestras:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.number_of_samples}</p>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Fecha de registro:</p>
                        <p className="text-sm sm:text-base font-medium">{formattedDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Biopsy Information (only for biopsy cases) */}
                  {isBiopsyCase && (
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        <FileText className="text-green-500 size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información de Biopsia</h3>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {/* Material Remitido */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Material Remitido:</p>
                          <p className="text-sm sm:text-base">{case_.material_remitido || 'No especificado'}</p>
                        </div>

                        {/* Información Clínica */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Información Clínica:</p>
                          <p className="text-sm sm:text-base">{case_.informacion_clinica || 'No especificado'}</p>
                        </div>

                        {/* Descripción Macroscópica */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Descripción Macroscópica:</p>
                          <p className="text-sm sm:text-base">{case_.descripcion_macroscopica || 'No especificado'}</p>
                        </div>

                        {/* Diagnóstico */}
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Diagnóstico:</p>
                          <p className="text-sm sm:text-base">{case_.diagnostico || 'No especificado'}</p>
                        </div>

                        {/* Comentario */}
                        {case_.comentario && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Comentario:</p>
                            <p className="text-sm sm:text-base">{case_.comentario}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <DollarSign className="text-purple-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información de Pago</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Monto total:</p>
                          <p className="text-sm sm:text-base font-medium">${case_.total_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Estado de pago:</p>
                          <div
                            className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(
                              case_.payment_status,
                            )}`}
                          >
                            {case_.payment_status}
                          </div>
                        </div>
                      </div>

                      {case_.remaining > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
                              Monto pendiente: ${case_.remaining.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Methods */}
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Métodos de pago:</p>
                        {case_.payment_method_1 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_1}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_1?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_1 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                Ref: {case_.payment_reference_1}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_2 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_2}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_2?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_2 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                Ref: {case_.payment_reference_2}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_3 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_3}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_3?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_3 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                Ref: {case_.payment_reference_3}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_4 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_4}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_4?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_4 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                Ref: {case_.payment_reference_4}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <FileText className="text-blue-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información Adicional</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {case_.comments && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Comentarios:</p>
                          <p className="text-sm sm:text-base">{case_.comments}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Fecha de creación:</p>
                          <p className="text-sm sm:text-base">
                            {case_.created_at
                              ? format(new Date(case_.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                              : 'N/A'}
                          </p>
                        </div>
                        {case_.created_by_display_name && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Creado por:</p>
                            <p className="text-sm sm:text-base">{case_.created_by_display_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {canDelete && (
                      <Button
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Caso
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmation Modal for Save */}
          <AnimatePresence>
            {isConfirmSaveOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[9999999999]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-[9999999999] p-4"
                >
                  <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Cambios</h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">Se realizarán los siguientes cambios:</p>

                      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {changes.map((change, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {change.fieldLabel}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              <span className="line-through">{formatValue(change.oldValue)}</span>
                              {' → '}
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatValue(change.newValue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsConfirmSaveOpen(false)}
                          className="flex-1"
                          disabled={isSaving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleConfirmSave}
                          disabled={isSaving}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar
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

          {/* Confirmation Modal for Delete */}
          <AnimatePresence>
            {isConfirmDeleteOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[9999999999]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-[9999999999] p-4"
                >
                  <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Eliminación</h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ¿Estás seguro de que deseas eliminar este caso? Esta acción no se puede deshacer.
                      </p>

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
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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