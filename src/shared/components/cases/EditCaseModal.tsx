import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle, User, DollarSign, FileText, Cake, Mail, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay } from '@lib/supabase-service'
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

// Validation schema for editing
const editCaseSchema = z.object({
	full_name: z.string().min(1, 'El nombre es requerido'),
	id_number: z.string().min(1, 'La cédula es requerida'),
	phone: z.string().min(1, 'El teléfono es requerido').max(15, 'Máximo 15 caracteres'),
	email: z.string().email('Email inválido').optional().nullable(),
	date_of_birth: z.date().optional().nullable(),
	comments: z.string().optional(),
	payment_method_1: z.string().optional(),
	payment_amount_1: z.coerce.number().min(0).optional().nullable(),
	payment_reference_1: z.string().optional(),
	payment_method_2: z.string().optional(),
	payment_amount_2: z.coerce.number().min(0).optional().nullable(),
	payment_reference_2: z.string().optional(),
	payment_method_3: z.string().optional(),
	payment_amount_3: z.coerce.number().min(0).optional().nullable(),
	payment_reference_3: z.string().optional(),
	payment_method_4: z.string().optional(),
	payment_amount_4: z.coerce.number().min(0).optional().nullable(),
	payment_reference_4: z.string().optional(),
})

type EditCaseFormData = z.infer<typeof editCaseSchema>

interface Change {
	field: string
	fieldLabel: string
	oldValue: any
	newValue: any
}

const paymentMethods = ['Punto de venta', 'Dólares en efectivo', 'Zelle', 'Pago móvil', 'Bs en efectivo']

// Moved PaymentMethodSection outside to prevent re-creation on each render
const PaymentMethodSection = React.memo(({ index, form }: { index: number; form: any }) => {
	const methodField = `payment_method_${index}` as keyof EditCaseFormData
	const amountField = `payment_amount_${index}` as keyof EditCaseFormData
	const referenceField = `payment_reference_${index}` as keyof EditCaseFormData

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-background rounded-lg">
			<FormField
				control={form.control}
				name={methodField}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Método de Pago {index}</FormLabel>
						<Select
							onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
							value={field.value?.toString() || 'none'}
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
				name={amountField}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Monto {index}</FormLabel>
						<FormControl>
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								{...field}
								value={field.value || ''}
								onChange={(e) => {
									const value = e.target.value
									field.onChange(value === '' ? null : parseFloat(value))
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
							<Input placeholder="Referencia de pago" {...field} value={field.value || ''} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
})

PaymentMethodSection.displayName = 'PaymentMethodSection'

interface EditCaseModalProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
	onSave: (caseId: string, updates: Partial<MedicalRecord>, changes: Change[]) => Promise<void>
}

const EditCaseModal: React.FC<EditCaseModalProps> = ({ case_, isOpen, onClose, onSave }) => {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [changes, setChanges] = useState<Change[]>([])
	const [isSaving, setIsSaving] = useState(false)
	const [isDateOfBirthOpen, setIsDateOfBirthOpen] = useState(false)
	const { toast } = useToast()

	const form = useForm<EditCaseFormData>({
		resolver: zodResolver(editCaseSchema),
		defaultValues: {
			full_name: '',
			id_number: '',
			phone: '',
			email: null,
			date_of_birth: null,
			comments: '',
			payment_method_1: undefined,
			payment_amount_1: null,
			payment_reference_1: '',
			payment_method_2: undefined,
			payment_amount_2: null,
			payment_reference_2: '',
			payment_method_3: undefined,
			payment_amount_3: null,
			payment_reference_3: '',
			payment_method_4: undefined,
			payment_amount_4: null,
			payment_reference_4: '',
		},
	})

	// Reset form when case changes
	useEffect(() => {
		if (case_ && isOpen) {
			// Parse date_of_birth string to Date object if it exists
			let dateOfBirth = null
			if (case_.date_of_birth) {
				try {
					dateOfBirth = parseISO(case_.date_of_birth)
				} catch (error) {
					console.error('Error parsing date of birth:', error)
				}
			}

			form.reset({
				full_name: case_.full_name || '',
				id_number: case_.id_number || '',
				phone: case_.phone || '',
				email: case_.email || null,
				date_of_birth: dateOfBirth,
				comments: case_.comments || '',
				payment_method_1: case_.payment_method_1 || undefined,
				payment_amount_1: case_.payment_amount_1,
				payment_reference_1: case_.payment_reference_1 || '',
				payment_method_2: case_.payment_method_2 || undefined,
				payment_amount_2: case_.payment_amount_2,
				payment_reference_2: case_.payment_reference_2 || '',
				payment_method_3: case_.payment_method_3 || undefined,
				payment_amount_3: case_.payment_amount_3,
				payment_reference_3: case_.payment_reference_3 || '',
				payment_method_4: case_.payment_method_4 || undefined,
				payment_amount_4: case_.payment_amount_4,
				payment_reference_4: case_.payment_reference_4 || '',
			})
		}
	}, [case_, isOpen, form])

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
		}
		return labels[field] || field
	}

	const formatValue = (value: any): string => {
		if (value === null || value === undefined || value === '') return 'Vacío'
		if (value instanceof Date) return format(value, 'dd/MM/yyyy', { locale: es })
		if (typeof value === 'number') return value.toString()
		return String(value)
	}

	const detectChanges = (formData: EditCaseFormData): Change[] => {
		if (!case_) return []

		const detectedChanges: Change[] = []
		const fieldsToCheck = Object.keys(formData) as (keyof EditCaseFormData)[]

		fieldsToCheck.forEach((field) => {
			let oldValue = case_[field as keyof MedicalRecord]
			let newValue = formData[field]

			// Special handling for date_of_birth
			if (field === 'date_of_birth') {
				// Convert string date to Date object for comparison
				if (case_.date_of_birth && newValue) {
					try {
						const oldDate = parseISO(case_.date_of_birth)
						// If dates are different, format them as strings for the change log
						if (oldDate.getTime() !== (newValue as Date).getTime()) {
							detectedChanges.push({
								field,
								fieldLabel: getFieldLabel(field),
								oldValue: format(oldDate, 'yyyy-MM-dd'),
								newValue: format(newValue as Date, 'yyyy-MM-dd'),
							})
						}
					} catch (error) {
						console.error('Error comparing dates:', error)
					}
				} else if ((!case_.date_of_birth && newValue) || (case_.date_of_birth && !newValue)) {
					// One is null and the other isn't
					detectedChanges.push({
						field,
						fieldLabel: getFieldLabel(field),
						oldValue: case_.date_of_birth || null,
						newValue: newValue ? format(newValue as Date, 'yyyy-MM-dd') : null,
					})
				}
				return // Skip the rest of the comparison for date_of_birth
			}

			// Special handling for payment methods - convert undefined to null for comparison
			const normalizedOld = oldValue === null || oldValue === undefined || oldValue === '' ? null : oldValue
			const normalizedNew = newValue === null || newValue === undefined || newValue === '' ? null : newValue

			// Convert to strings for comparison, but keep original values for storage
			const oldStr = normalizedOld === null ? '' : String(normalizedOld)
			const newStr = normalizedNew === null ? '' : String(normalizedNew)

			if (oldStr !== newStr) {
				detectedChanges.push({
					field,
					fieldLabel: getFieldLabel(field),
					oldValue: normalizedOld,
					newValue: normalizedNew,
				})
			}
		})

		return detectedChanges
	}

	const handleSubmit = (formData: EditCaseFormData) => {
		const detectedChanges = detectChanges(formData)

		if (detectedChanges.length === 0) {
			toast({
				title: 'Sin cambios',
				description: 'No se detectaron cambios para guardar.',
				variant: 'default',
			})
			return
		}

		setChanges(detectedChanges)
		setIsConfirmOpen(true)
	}

	const handleConfirmSave = async () => {
		if (!case_) return

		setIsSaving(true)
		try {
			// Prepare updates object
			const updates: Partial<MedicalRecord> = {}
			changes.forEach((change) => {
				// Special handling for date_of_birth to format as string
				if (change.field === 'date_of_birth' && change.newValue instanceof Date) {
					updates[change.field as keyof MedicalRecord] = format(change.newValue, 'yyyy-MM-dd') as any
				} else if (typeof change.newValue === 'string' || typeof change.newValue === 'number' || change.newValue === null) {
					updates[change.field as keyof MedicalRecord] = change.newValue as any
				} else {
					updates[change.field as keyof MedicalRecord] = undefined
				}
			})

			await onSave(case_.id!, updates, changes)

			toast({
				title: '✅ Caso actualizado',
				description: `Se guardaron ${changes.length} cambio(s) exitosamente.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			setIsConfirmOpen(false)
			onClose()
		} catch (error) {
			console.error('Error saving case:', error)
			toast({
				title: '❌ Error al guardar',
				description: 'Hubo un problema al guardar los cambios. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
		}
	}

	if (!case_) return null

	// Get age display from date of birth
	const dateOfBirthValue = form.watch('date_of_birth')
	const ageDisplay = dateOfBirthValue 
		? getAgeDisplay(format(dateOfBirthValue, 'yyyy-MM-dd')) 
		: (case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : '')

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
						className="fixed inset-0 bg-black/50 z-[999998]"
					/>

					{/* Main Modal */}
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-background shadow-2xl z-[999999] overflow-y-auto border-l border-input"
					>
						{/* Header */}
						<div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Editar Caso</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										{case_.code || case_.id?.slice(-6).toUpperCase()}
									</p>
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
									{/* Patient Info (Now Editable) */}
									<div className="bg-white dark:bg-background rounded-lg p-4 border border-input">
										<div className="flex items-center gap-2 mb-3">
											<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
											<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
												Información del Paciente
											</h3>
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
															<Input 
																placeholder="Nombre y Apellido" 
																{...field} 
																className="focus:border-primary focus:ring-primary"
															/>
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
															<Input 
																placeholder="12345678" 
																{...field} 
																className="focus:border-primary focus:ring-primary"
															/>
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
															<Input 
																placeholder="0412-1234567" 
																{...field} 
																className="focus:border-primary focus:ring-primary"
															/>
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
										</div>
									</div>

									{/* Date of Birth Section */}
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<Cake className="w-5 h-5 text-pink-600 dark:text-pink-400" />
											<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fecha de Nacimiento</h3>
										</div>

										<FormField
											control={form.control}
											name="date_of_birth"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Fecha de Nacimiento</FormLabel>
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
														<PopoverContent className="w-auto p-0">
															<Calendar
																mode="single"
																selected={field.value || undefined}
																onSelect={(date) => {
																	field.onChange(date)
																	setIsDateOfBirthOpen(false)
																}}
																disabled={(date) => {
																	const today = new Date()
																	const maxAge = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate())
																	return date > today || date < maxAge
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

									{/* Comments Section */}
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
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
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Payment Methods Section */}
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
											<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Métodos de Pago</h3>
										</div>

										<div className="space-y-4">
											{[1, 2, 3, 4].map((index) => (
												<PaymentMethodSection key={index} index={index} form={form} />
											))}
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
										<Button type="button" variant="outline" onClick={onClose} className="flex-1">
											Cancelar
										</Button>
										<Button type="submit" className="flex-1 bg-primary hover:bg-primary/80">
											<Save className="w-4 h-4 mr-2" />
											Guardar Cambios
										</Button>
									</div>
								</form>
							</Form>
						</div>
					</motion.div>

					{/* Confirmation Modal */}
					<AnimatePresence>
						{isConfirmOpen && (
							<>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="fixed inset-0 bg-black/70 z-[99999999]"
								/>
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="fixed inset-0 flex items-center justify-center z-[99999999] p-4"
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
													onClick={() => setIsConfirmOpen(false)}
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
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
															Guardando...
														</>
													) : (
														<>
															<Save className="w-4 h-4 mr-2" />
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
				</>
			)}
		</AnimatePresence>
	)
}

export default EditCaseModal