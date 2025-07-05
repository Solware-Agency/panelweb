import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Edit, Save, AlertTriangle, Loader2, Trash2, User, FileText, DollarSign, Microscope, Calendar, Mail, Phone, MapPin } from 'lucide-react'
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
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Validation schema for editing
const editCaseSchema = z.object({
  // Patient Information
  full_name: z.string().min(1, 'El nombre es requerido'),
  id_number: z.string().min(1, 'La cédula es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().nullable(),
  
  // Medical Information
  exam_type: z.string().min(1, 'El tipo de examen es requerido'),
  origin: z.string().min(1, 'La procedencia es requerida'),
  treating_doctor: z.string().min(1, 'El médico tratante es requerido'),
  sample_type: z.string().min(1, 'El tipo de muestra es requerido'),
  number_of_samples: z.coerce.number().int().positive('Debe ser un número positivo'),
  branch: z.string().min(1, 'La sede es requerida'),
  
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
});

type EditCaseFormData = z.infer<typeof editCaseSchema>;

interface Change {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

const paymentMethods = ['Punto de venta', 'Dólares en efectivo', 'Zelle', 'Pago móvil', 'Bs en efectivo'];
const examTypes = ['inmunohistoquimica', 'biopsia', 'citologia'];

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  // Determine if user can edit or delete records based on role
  const canEdit = profile?.role === 'owner' || profile?.role === 'employee';
  const canDelete = profile?.role === 'owner' || profile?.role === 'employee';

  const form = useForm<EditCaseFormData>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      full_name: '',
      id_number: '',
      phone: '',
      email: null,
      exam_type: '',
      origin: '',
      treating_doctor: '',
      sample_type: '',
      number_of_samples: 1,
      branch: '',
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
    },
  });

  // Reset form when case changes
  useEffect(() => {
    if (case_ && isOpen) {
      form.reset({
        full_name: case_.full_name || '',
        id_number: case_.id_number || '',
        phone: case_.phone || '',
        email: case_.email || null,
        exam_type: case_.exam_type || '',
        origin: case_.origin || '',
        treating_doctor: case_.treating_doctor || '',
        sample_type: case_.sample_type || '',
        number_of_samples: case_.number_of_samples || 1,
        branch: case_.branch || '',
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
      
      // Exit edit mode when case changes
      setIsEditMode(false);
    }
  }, [case_, isOpen, form]);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      full_name: 'Nombre Completo',
      id_number: 'Cédula',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      exam_type: 'Tipo de Examen',
      origin: 'Procedencia',
      treating_doctor: 'Médico Tratante',
      sample_type: 'Tipo de Muestra',
      number_of_samples: 'Cantidad de Muestras',
      branch: 'Sede',
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

      // Special handling for payment methods - convert undefined to null for comparison
      const normalizedOld = oldValue === undefined ? null : oldValue;
      const normalizedNew = newValue === undefined ? null : newValue;

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

  const handleSubmit = async (formData: EditCaseFormData) => {
    if (!case_ || !user) return;

    const changes = detectChanges(formData);

    if (changes.length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No se detectaron cambios para guardar.',
        variant: 'default',
      });
      setIsEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      // Prepare updates object
      const updates: Partial<MedicalRecord> = {};
      changes.forEach((change) => {
        updates[change.field as keyof MedicalRecord] = change.newValue as any;
      });

      const { error } = await updateMedicalRecordWithLog(
        case_.id!,
        updates,
        changes,
        user.id,
        user.email || 'unknown@email.com'
      );

      if (error) {
        throw error;
      }

      toast({
        title: '✅ Caso actualizado',
        description: `Se guardaron ${changes.length} cambio(s) exitosamente.`,
        className: 'bg-green-100 border-green-400 text-green-800',
      });

      setIsEditMode(false);
      if (onSave) onSave();
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
              if (!isEditMode) onClose();
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
          >
            <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {isEditMode ? 'Editar Caso' : 'Detalles del Caso'}
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                      {case_.code && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {case_.code}
                        </span>
                      )}
                      <span
                        className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          case_.payment_status,
                        )}`}
                      >
                        {case_.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditMode && canEdit && (
                      <Button
                        onClick={() => setIsEditMode(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      disabled={isEditMode && isSaving}
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {isEditMode ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 sm:p-6 space-y-6">
                    {/* Patient Information Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="text-blue-500 size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información del Paciente</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Completo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="id_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cédula</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  {...field} 
                                  value={field.value || ''} 
                                  onChange={(e) => field.onChange(e.target.value || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Medical Information Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-4">
                        <Microscope className="text-primary size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información Médica</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <SelectValue placeholder="Seleccionar tipo de examen" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {examTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                          name="treating_doctor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Médico Tratante</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Procedencia</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="branch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sede</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sede" />
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
                        <FormField
                          control={form.control}
                          name="sample_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Muestra</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number_of_samples"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad de Muestras</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Payment Information Section */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="text-purple-500 size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información de Pago</h3>
                      </div>
                      
                      {/* Payment Methods */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((index) => {
                          const methodField = `payment_method_${index}` as keyof EditCaseFormData;
                          const amountField = `payment_amount_${index}` as keyof EditCaseFormData;
                          const referenceField = `payment_reference_${index}` as keyof EditCaseFormData;
                          
                          return (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <FormField
                                control={form.control}
                                name={methodField}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Método de Pago {index}</FormLabel>
                                    <Select
                                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                                      value={field.value || 'none'}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar método" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
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
                                name={amountField}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Monto {index}</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
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
                                name={referenceField}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Referencia {index}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Referencia de pago" 
                                        value={field.value || ''} 
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-blue-500 size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información Adicional</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comentarios</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Agregar comentarios adicionales..." 
                                className="min-h-[100px]" 
                                value={field.value || ''} 
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditMode(false)} 
                        className="flex-1"
                        disabled={isSaving}
                      >
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
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Patient Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="text-blue-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información del Paciente</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nombre completo:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Cédula:</p>
                          <p className="text-sm sm:text-base font-medium">{case_.id_number}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Microscope className="text-primary size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información Médica</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {case_.exam_type?.toLowerCase() === 'biopsia' && (
                    <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-green-500 size-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Información de Biopsia</h3>
                      </div>
                      <div className="space-y-4">
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
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Comentario:</p>
                          <p className="text-sm sm:text-base">{case_.comentario || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="text-purple-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información de Pago</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
                              Monto pendiente: ${case_.remaining.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Methods */}
                      <div className="space-y-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Métodos de pago:</p>
                        {case_.payment_method_1 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_1}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_1?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_1 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ref: {case_.payment_reference_1}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_2 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_2}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_2?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_2 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ref: {case_.payment_reference_2}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_3 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_3}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_3?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_3 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ref: {case_.payment_reference_3}
                              </p>
                            )}
                          </div>
                        )}
                        {case_.payment_method_4 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="text-xs sm:text-sm font-medium">{case_.payment_method_4}</p>
                              <p className="text-xs sm:text-sm font-medium">${case_.payment_amount_4?.toLocaleString() || 0}</p>
                            </div>
                            {case_.payment_reference_4 && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="text-blue-500 size-6" />
                      <h3 className="text-lg sm:text-xl font-semibold">Información Adicional</h3>
                    </div>
                    <div className="space-y-4">
                      {case_.comments && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Comentarios:</p>
                          <p className="text-sm sm:text-base">{case_.comments}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmation Modal for Delete */}
          <AnimatePresence>
            {isConfirmDeleteOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-[999999999]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-[999999999] p-4"
                >
                  <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
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

          {/* Delete button that appears in view mode */}
          {!isEditMode && canDelete && (
            <div className="absolute bottom-4 right-4 z-[9999999]">
              <Button
                onClick={() => setIsConfirmDeleteOpen(true)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Caso
              </Button>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default UnifiedCaseModal;