import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Edit2, Save, User, Calendar, Phone, Mail, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Microscope } from 'lucide-react'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay, updateMedicalRecordWithLog } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@app/providers/AuthContext'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Calendar as CalendarComponent } from '@shared/components/ui/calendar'
import { cn } from '@shared/lib/cn'
import EditCaseModal from './EditCaseModal'

interface CaseDetailPanelProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
}

interface Change {
	field: string
	fieldLabel: string
	oldValue: any
	newValue: any
}

const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({ case_, isOpen, onClose }) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editedValues, setEditedValues] = useState<Partial<MedicalRecord>>({})
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

	// Reset edited values when case changes
	useEffect(() => {
		if (case_) {
			setEditedValues({})
			setIsEditing(false)
		}
	}, [case_])

	if (!case_) return null

	const handleEditClick = () => {
		setIsEditing(true)
		// Initialize edited values with current values
		setEditedValues({
			exam_type: case_.exam_type,
			treating_doctor: case_.treating_doctor,
			origin: case_.origin,
			branch: case_.branch,
			sample_type: case_.sample_type,
			number_of_samples: case_.number_of_samples,
			date: case_.date,
			material_remitido: case_.material_remitido || '',
			informacion_clinica: case_.informacion_clinica || '',
			descripcion_macroscopica: case_.descripcion_macroscopica || '',
			diagnostico: case_.diagnostico || '',
			comentario: case_.comentario || ''
		})
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setEditedValues({})
	}

	const handleInputChange = (field: keyof MedicalRecord, value: any) => {
		setEditedValues(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handleSaveChanges = async () => {
		if (!user || !case_) return

		// Detect changes
		const changes: Change[] = []
		Object.entries(editedValues).forEach(([field, value]) => {
			const currentValue = case_[field as keyof MedicalRecord]
			if (value !== currentValue) {
				// Get field label for display
				const fieldLabels: Record<string, string> = {
					exam_type: 'Tipo de Examen',
					treating_doctor: 'Médico Tratante',
					origin: 'Procedencia',
					branch: 'Sede',
					sample_type: 'Tipo de Muestra',
					number_of_samples: 'Cantidad de Muestras',
					date: 'Fecha de Registro',
					material_remitido: 'Material Remitido',
					informacion_clinica: 'Información Clínica',
					descripcion_macroscopica: 'Descripción Macroscópica',
					diagnostico: 'Diagnóstico',
					comentario: 'Comentario'
				}

				changes.push({
					field,
					fieldLabel: fieldLabels[field] || field,
					oldValue: currentValue,
					newValue: value
				})
			}
		})

		if (changes.length === 0) {
			toast({
				title: 'Sin cambios',
				description: 'No se detectaron cambios para guardar.',
				variant: 'default',
			})
			setIsEditing(false)
			return
		}

		setIsSaving(true)
		try {
			// Update record with changes
			const { error } = await updateMedicalRecordWithLog(
				case_.id!,
				editedValues,
				changes,
				user.id,
				user.email || 'unknown@email.com'
			)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso actualizado',
				description: `Se guardaron ${changes.length} cambio(s) exitosamente.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			setIsEditing(false)
			// Refresh the case data (this would typically be handled by the parent component)
			// For now, we'll just update the local state
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

	const handleSaveInEditModal = async (caseId: string, updates: Partial<MedicalRecord>, changes: Change[]) => {
		if (!user) return

		try {
			const { error } = await updateMedicalRecordWithLog(
				caseId,
				updates,
				changes,
				user.id,
				user.email || 'unknown@email.com'
			)

			if (error) {
				throw error
			}

			// Close the modal and refresh data
			onClose()
		} catch (error) {
			console.error('Error saving case in modal:', error)
			throw error
		}
	}

	// Format date for display
	const formattedDate = case_.date ? format(new Date(case_.date), 'dd/MM/yyyy', { locale: es }) : 'N/A'
	
	// Get age display from date of birth
	const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''

	// Format date of birth for display
	const formattedDateOfBirth = case_.date_of_birth 
		? format(parseISO(case_.date_of_birth), 'dd/MM/yyyy', { locale: es })
		: 'N/A'

	// Get payment status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completado':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'Pendiente':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			default:
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
		}
	}

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
						className="fixed inset-0 bg-black/50 z-[99999998]"
					/>

					{/* Main Panel */}
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-background shadow-2xl z-[99999999] overflow-y-auto rounded-lg border-l border-input"
					>
						{/* Header */}
						<div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Detalles del Caso</h2>
									<div className="flex items-center gap-2 mt-2">
										{case_.code && (
											<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
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
									{!isEditing && (
										<button
											onClick={handleEditClick}
											className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
										>
											<Edit2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
										</button>
									)}
									<button
										onClick={onClose}
										className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
									>
										<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
									</button>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="p-4 sm:p-6 space-y-6">
							{/* Patient Information */}
							<div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
								<div className="flex items-center gap-2 mb-4">
									<User className="text-blue-500 size-6" />
									<h3 className="text-xl font-semibold">Información del Paciente</h3>
								</div>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo:</p>
											<p className="text-base font-medium">{case_.full_name}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Cédula:</p>
											<p className="text-base font-medium">{case_.id_number}</p>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Fecha de nacimiento:</p>
											<p className="text-base font-medium">
												{formattedDateOfBirth}
												{ageDisplay && <span className="ml-2 text-sm text-blue-600">({ageDisplay})</span>}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Teléfono:</p>
											<p className="text-base font-medium">{case_.phone}</p>
										</div>
									</div>
									{case_.email && (
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Email:</p>
											<p className="text-base font-medium">{case_.email}</p>
										</div>
									)}
								</div>
							</div>

							{/* Medical Information */}
							<div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
								<div className="flex items-center justify-between gap-2 mb-4">
									<div className="flex items-center gap-2">
										<Microscope className="text-primary size-6" />
										<h3 className="text-xl font-semibold">Información Médica</h3>
									</div>
									{isEditing && (
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
												Cancelar
											</Button>
											<Button 
												size="sm" 
												onClick={handleSaveChanges} 
												disabled={isSaving}
												className="bg-primary hover:bg-primary/80"
											>
												{isSaving ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
														Guardando...
													</>
												) : (
													<>
														<Save className="w-4 h-4 mr-2" />
														Guardar
													</>
												)}
											</Button>
										</div>
									)}
								</div>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Exam Type */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Estudio:</p>
											{isEditing ? (
												<Select 
													value={editedValues.exam_type || case_.exam_type} 
													onValueChange={(value) => handleInputChange('exam_type', value)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Seleccione tipo de examen" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="inmunohistoquimica">Inmunohistoquímica</SelectItem>
														<SelectItem value="biopsia">Biopsia</SelectItem>
														<SelectItem value="citologia">Citología</SelectItem>
													</SelectContent>
												</Select>
											) : (
												<p className="text-base font-medium">{case_.exam_type}</p>
											)}
										</div>
										
										{/* Treating Doctor */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Médico tratante:</p>
											{isEditing ? (
												<Input 
													value={editedValues.treating_doctor || case_.treating_doctor} 
													onChange={(e) => handleInputChange('treating_doctor', e.target.value)}
												/>
											) : (
												<p className="text-base font-medium">{case_.treating_doctor}</p>
											)}
										</div>
									</div>
									
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Origin */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Procedencia:</p>
											{isEditing ? (
												<Input 
													value={editedValues.origin || case_.origin} 
													onChange={(e) => handleInputChange('origin', e.target.value)}
												/>
											) : (
												<p className="text-base font-medium">{case_.origin}</p>
											)}
										</div>
										
										{/* Branch */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Sede:</p>
											{isEditing ? (
												<Select 
													value={editedValues.branch || case_.branch} 
													onValueChange={(value) => handleInputChange('branch', value)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Seleccione una sede" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="PMG">PMG</SelectItem>
														<SelectItem value="CPC">CPC</SelectItem>
														<SelectItem value="CNX">CNX</SelectItem>
														<SelectItem value="STX">STX</SelectItem>
														<SelectItem value="MCY">MCY</SelectItem>
													</SelectContent>
												</Select>
											) : (
												<p className="text-base font-medium">{case_.branch}</p>
											)}
										</div>
									</div>
									
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Sample Type */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Muestra:</p>
											{isEditing ? (
												<Input 
													value={editedValues.sample_type || case_.sample_type} 
													onChange={(e) => handleInputChange('sample_type', e.target.value)}
												/>
											) : (
												<p className="text-base font-medium">{case_.sample_type}</p>
											)}
										</div>
										
										{/* Number of Samples */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Cantidad de muestras:</p>
											{isEditing ? (
												<Input 
													type="number"
													min="1"
													value={editedValues.number_of_samples || case_.number_of_samples} 
													onChange={(e) => handleInputChange('number_of_samples', parseInt(e.target.value))}
												/>
											) : (
												<p className="text-base font-medium">{case_.number_of_samples}</p>
											)}
										</div>
									</div>
									
									{/* Registration Date */}
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400">Fecha de registro:</p>
										{isEditing ? (
											<Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="w-full justify-start text-left font-normal"
													>
														<Calendar className="mr-2 h-4 w-4" />
														{editedValues.date ? format(new Date(editedValues.date), 'PPP', { locale: es }) : formattedDate}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0">
													<CalendarComponent
														mode="single"
														selected={editedValues.date ? new Date(editedValues.date) : new Date(case_.date)}
														onSelect={(date) => {
															if (date) {
																handleInputChange('date', date.toISOString())
																setIsDatePickerOpen(false)
															}
														}}
														initialFocus
														locale={es}
													/>
												</PopoverContent>
											</Popover>
										) : (
											<p className="text-base font-medium">{formattedDate}</p>
										)}
									</div>
								</div>
							</div>

							{/* Biopsy Information (only for biopsy cases) */}
							{case_.exam_type?.toLowerCase() === 'biopsia' && (
								<div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
									<div className="flex items-center gap-2 mb-4">
										<FileText className="text-green-500 size-6" />
										<h3 className="text-xl font-semibold">Información de Biopsia</h3>
									</div>
									<div className="space-y-4">
										{/* Material Remitido */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Material Remitido:</p>
											{isEditing ? (
												<Textarea 
													value={editedValues.material_remitido || case_.material_remitido || ''} 
													onChange={(e) => handleInputChange('material_remitido', e.target.value)}
													className="min-h-[80px]"
												/>
											) : (
												<p className="text-base">{case_.material_remitido || 'No especificado'}</p>
											)}
										</div>
										
										{/* Información Clínica */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Información Clínica:</p>
											{isEditing ? (
												<Textarea 
													value={editedValues.informacion_clinica || case_.informacion_clinica || ''} 
													onChange={(e) => handleInputChange('informacion_clinica', e.target.value)}
													className="min-h-[80px]"
												/>
											) : (
												<p className="text-base">{case_.informacion_clinica || 'No especificado'}</p>
											)}
										</div>
										
										{/* Descripción Macroscópica */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Descripción Macroscópica:</p>
											{isEditing ? (
												<Textarea 
													value={editedValues.descripcion_macroscopica || case_.descripcion_macroscopica || ''} 
													onChange={(e) => handleInputChange('descripcion_macroscopica', e.target.value)}
													className="min-h-[100px]"
												/>
											) : (
												<p className="text-base">{case_.descripcion_macroscopica || 'No especificado'}</p>
											)}
										</div>
										
										{/* Diagnóstico */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Diagnóstico:</p>
											{isEditing ? (
												<Textarea 
													value={editedValues.diagnostico || case_.diagnostico || ''} 
													onChange={(e) => handleInputChange('diagnostico', e.target.value)}
													className="min-h-[100px]"
												/>
											) : (
												<p className="text-base">{case_.diagnostico || 'No especificado'}</p>
											)}
										</div>
										
										{/* Comentario */}
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Comentario:</p>
											{isEditing ? (
												<Textarea 
													value={editedValues.comentario || case_.comentario || ''} 
													onChange={(e) => handleInputChange('comentario', e.target.value)}
													className="min-h-[80px]"
												/>
											) : (
												<p className="text-base">{case_.comentario || 'No especificado'}</p>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Payment Information */}
							<div className="bg-white dark:bg-background rounded-lg p-4 border border-input transition-all duration-300">
								<div className="flex items-center gap-2 mb-4">
									<DollarSign className="text-purple-500 size-6" />
									<h3 className="text-xl font-semibold">Información de Pago</h3>
								</div>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Monto total:</p>
											<p className="text-base font-medium">${case_.total_amount.toLocaleString()}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Estado de pago:</p>
											<div className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(case_.payment_status)}`}>
												{case_.payment_status}
											</div>
										</div>
									</div>

									{case_.remaining > 0 && (
										<div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
											<div className="flex items-center gap-2">
												<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
												<p className="text-sm font-medium text-red-800 dark:text-red-300">
													Monto pendiente: ${case_.remaining.toLocaleString()}
												</p>
											</div>
										</div>
									)}

									{/* Payment Methods */}
									<div className="space-y-3">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Métodos de pago:</p>
										{case_.payment_method_1 && (
											<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
												<div className="flex justify-between">
													<p className="text-sm font-medium">{case_.payment_method_1}</p>
													<p className="text-sm font-medium">${case_.payment_amount_1?.toLocaleString() || 0}</p>
												</div>
												{case_.payment_reference_1 && (
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_1}
													</p>
												)}
											</div>
										)}
										{case_.payment_method_2 && (
											<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
												<div className="flex justify-between">
													<p className="text-sm font-medium">{case_.payment_method_2}</p>
													<p className="text-sm font-medium">${case_.payment_amount_2?.toLocaleString() || 0}</p>
												</div>
												{case_.payment_reference_2 && (
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_2}
													</p>
												)}
											</div>
										)}
										{case_.payment_method_3 && (
											<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
												<div className="flex justify-between">
													<p className="text-sm font-medium">{case_.payment_method_3}</p>
													<p className="text-sm font-medium">${case_.payment_amount_3?.toLocaleString() || 0}</p>
												</div>
												{case_.payment_reference_3 && (
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_3}
													</p>
												)}
											</div>
										)}
										{case_.payment_method_4 && (
											<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
												<div className="flex justify-between">
													<p className="text-sm font-medium">{case_.payment_method_4}</p>
													<p className="text-sm font-medium">${case_.payment_amount_4?.toLocaleString() || 0}</p>
												</div>
												{case_.payment_reference_4 && (
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
									<h3 className="text-xl font-semibold">Información Adicional</h3>
								</div>
								<div className="space-y-4">
									{case_.comments && (
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">Comentarios:</p>
											<p className="text-base">{case_.comments}</p>
										</div>
									)}
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
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
								<Button variant="outline" onClick={onClose} className="flex-1">
									Cerrar
								</Button>
								<Button
									onClick={() => setIsEditModalOpen(true)}
									className="flex-1 bg-primary hover:bg-primary/80"
								>
									<Edit2 className="w-4 h-4 mr-2" />
									Editar Completo
								</Button>
							</div>
						</div>
					</motion.div>

					{/* Edit Modal */}
					<EditCaseModal
						case_={case_}
						isOpen={isEditModalOpen}
						onClose={() => setIsEditModalOpen(false)}
						onSave={handleSaveInEditModal}
					/>
				</>
			)}
		</AnimatePresence>
	)
}

export default CaseDetailPanel