import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
	X,
	User,
	Stethoscope,
	CreditCard,
	FileText,
	// CheckCircle,
	Hash,
	Download,
	Edit,
	Trash2,
	Loader2,
	AlertCircle,
	Save,
	XCircle,
	Plus,
	DollarSign,
	History,
	Eye,
	Send,
} from 'lucide-react'
import type { MedicalRecord } from '@lib/supabase-service'
import { deleteMedicalRecord, updateMedicalRecordWithLog, getChangeLogsForRecord } from '@lib/supabase-service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { createDropdownOptions } from '@shared/components/ui/form-dropdown'
import { CustomDropdown } from '@shared/components/ui/custom-dropdown'
import { AutocompleteInput } from '@shared/components/ui/autocomplete-input'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import TagInput from '@shared/components/ui/tag-input'
import { WhatsAppIcon } from '@shared/components/icons/WhatsAppIcon'
import {
	parseDecimalNumber,
	createCalculatorInputHandler,
	isVESPaymentMethod,
	convertVEStoUSD,
	autoCorrectDecimalAmount,
} from '@shared/utils/number-utils'
import { useBodyScrollLock } from '@shared/hooks/useBodyScrollLock'
import { useGlobalOverlayOpen } from '@shared/hooks/useGlobalOverlayOpen'

interface ChangeLogEntry {
	id: string
	medical_record_id: string
	user_id: string
	user_email: string
	field_name: string
	field_label: string
	old_value: string | null
	new_value: string | null
	changed_at: string
}

interface CaseDetailPanelProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
	onSave?: () => void
	onDelete?: () => void
	onCaseSelect: (case_: MedicalRecord) => void
}

interface ImmunoRequest {
	id: string
	case_id: string
	inmunorreacciones: string
	n_reacciones: number
	precio_unitario: number
	total: number
	pagado: boolean
	created_at: string
	updated_at: string
}

// Helper to parse edad string like "10 AÑOS" or "5 MESES"
function parseEdad(edad: string | null | undefined): { value: number | ''; unit: 'AÑOS' | 'MESES' | '' } {
	if (!edad) return { value: '', unit: '' }
	const match = String(edad)
		.trim()
		.match(/^(\d+)\s*(AÑOS|MESES)$/i)
	if (!match) return { value: '', unit: '' }
	const value = Number(match[1])
	const unit = match[2].toUpperCase() as 'AÑOS' | 'MESES'
	return { value: Number.isNaN(value) ? '' : value, unit }
}

// Stable InfoRow component to avoid remounts on each keystroke
interface InfoRowProps {
	label: string
	value: string | number | undefined
	field?: string
	editable?: boolean
	type?: 'text' | 'number' | 'email'
	isEditing?: boolean
	editedValue?: string | number | null
	onChange?: (field: string, value: unknown) => void
}

const InfoRow: React.FC<InfoRowProps> = React.memo(
	({ label, value, field, editable = true, type = 'text', isEditing = false, editedValue, onChange }) => {
		const isEditableField = Boolean(isEditing && editable && field && onChange)
		const displayValue = field ? editedValue ?? value : value

		return (
			<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
				<span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
				{isEditableField ? (
					<div className="sm:w-1/2">
						<Input
							type={type}
							value={String(displayValue ?? '')}
							onChange={(e) => onChange?.(field!, e.target.value)}
							className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
						/>
					</div>
				) : (
					<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
						{displayValue || 'N/A'}
					</span>
				)}
			</div>
		)
	},
)

const UnifiedCaseModal: React.FC<CaseDetailPanelProps> = React.memo(({ case_, isOpen, onClose, onSave, onDelete }) => {
	useBodyScrollLock(isOpen)
	useGlobalOverlayOpen(isOpen)
	const { toast } = useToast()
	const { user } = useAuth()
	const { profile } = useUserProfile()
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editedCase, setEditedCase] = useState<Partial<MedicalRecord>>({})
	const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
	const [newPayment, setNewPayment] = useState({
		method: '',
		amount: '',
		reference: '',
	})
	const [isChangelogOpen, setIsChangelogOpen] = useState(false)

	// Immunohistochemistry specific states
	const [immunoReactions, setImmunoReactions] = useState<string[]>([])
	const [isRequestingImmuno, setIsRequestingImmuno] = useState(false)

	// Query to get existing immuno request for this case
	const { data: existingImmunoRequest, refetch: refetchImmunoRequest } = useQuery({
		queryKey: ['immuno-request', case_?.id],
		queryFn: async () => {
			if (!case_?.id) return null

			const { data, error } = await supabase.from('immuno_requests').select('*').eq('case_id', case_.id).single()

			if (error && error.code !== 'PGRST116') {
				console.error('Error fetching immuno request:', error)
				return null
			}

			return data as ImmunoRequest | null
		},
		enabled: !!case_?.id && isOpen && case_?.exam_type?.toLowerCase().includes('inmuno'),
	})

	// Query to get the user who created the record
	const { data: creatorData } = useQuery({
		queryKey: ['record-creator', case_?.id],
		queryFn: async () => {
			if (!case_) return null

			// First try to get creator info from the record itself (for new records)
			if (case_.created_by && case_.created_by_display_name) {
				return {
					id: case_.created_by,
					email: '', // We don't have the email in the record
					displayName: case_.created_by_display_name,
				}
			}

			// If not available, try to get from change logs
			if (!case_.id) return null

			const { data, error } = await supabase
				.from('change_logs')
				.select('user_id, user_email, user_display_name')
				.eq('medical_record_id', case_.id)
				.order('changed_at', { ascending: true })
				.limit(1)

			if (error) {
				console.error('Error fetching record creator:', error)
				return null
			}

			if (data && data.length > 0) {
				// Get the user profile to get the display name
				const displayName = data[0].user_display_name
				if (displayName) {
					return {
						id: data[0].user_id,
						email: data[0].user_email,
						displayName,
					}
				}
				// fallback: fetch from profiles if not present
				const { data: profileData } = await supabase
					.from('profiles')
					.select('display_name')
					.eq('id', data[0].user_id)
					.single()
				return {
					id: data[0].user_id,
					email: data[0].user_email,
					displayName: profileData?.display_name || null,
				}
			}

			return null
		},
		enabled: !!case_?.id && isOpen,
	})

	// Query to get the updated case data after saving
	const { data: updatedCaseData, refetch: refetchCaseData } = useQuery({
		queryKey: ['case-data', case_?.id],
		queryFn: async () => {
			if (!case_?.id) return null

			const { data, error } = await supabase.from('medical_records_clean').select('*').eq('id', case_.id).single()

			if (error) {
				console.error('Error fetching updated case data:', error)
				return null
			}

			return data as MedicalRecord
		},
		enabled: !!case_?.id && isOpen,
	})

	// Use updated case data if available, otherwise fall back to original case
	const currentCase = updatedCaseData || case_

	// Query to get change logs for this record
	const {
		data: changelogsData,
		isLoading: isLoadingChangelogs,
		refetch: refetchChangelogs,
	} = useQuery({
		queryKey: ['record-changelogs', case_?.id],
		queryFn: async () => {
			if (!case_?.id) return { data: [] }
			return getChangeLogsForRecord(case_.id)
		},
		enabled: !!case_?.id && isOpen && isChangelogOpen,
	})

	// Initialize edited case when currentCase changes or when entering edit mode
	useEffect(() => {
		if (currentCase && isEditing) {
			// Auto-correct decimal amounts when loading for editing
			const correctedCase: Partial<MedicalRecord> = { ...currentCase }

			// Auto-correct payment amounts
			for (let i = 1; i <= 4; i++) {
				const methodKey = `payment_method_${i}` as keyof MedicalRecord
				const amountKey = `payment_amount_${i}` as keyof MedicalRecord

				const method = correctedCase[methodKey] as string | null
				const amount = correctedCase[amountKey] as number | null

				if (method && amount) {
					const { correctedAmount, wasCorreted, reason } = autoCorrectDecimalAmount(
						amount,
						method,
						currentCase.exchange_rate || undefined,
					)

					if (wasCorreted) {
						;(correctedCase as Partial<Record<keyof MedicalRecord, number | null>>)[amountKey] = correctedAmount
						console.log(`⚠️ Auto-corregido ${amountKey}:`, reason)
						toast({
							title: '⚠️ Auto-corregido desde BD',
							description: reason,
							className: 'bg-orange-100 border-orange-400 text-orange-800',
						})
					}
				}
			}

			setEditedCase({
				full_name: correctedCase.full_name,
				id_number: correctedCase.id_number,
				phone: correctedCase.phone,
				email: correctedCase.email,
				edad: correctedCase.edad,
				comments: correctedCase.comments,
				payment_method_1: correctedCase.payment_method_1,
				payment_amount_1: correctedCase.payment_amount_1,
				payment_reference_1: correctedCase.payment_reference_1,
				payment_method_2: correctedCase.payment_method_2,
				payment_amount_2: correctedCase.payment_amount_2,
				payment_reference_2: correctedCase.payment_reference_2,
				payment_method_3: correctedCase.payment_method_3,
				payment_amount_3: correctedCase.payment_amount_3,
				payment_reference_3: correctedCase.payment_reference_3,
				payment_method_4: correctedCase.payment_method_4,
				payment_amount_4: correctedCase.payment_amount_4,
				payment_reference_4: correctedCase.payment_reference_4,
			})
		} else {
			setEditedCase({})
		}
	}, [currentCase, isEditing, toast])

	// Initialize immuno reactions from existing request
	useEffect(() => {
		if (existingImmunoRequest) {
			const reactions = existingImmunoRequest.inmunorreacciones
				.split(',')
				.map((r) => r.trim())
				.filter((r) => r)
			setImmunoReactions(reactions)
		} else {
			setImmunoReactions([])
		}
	}, [existingImmunoRequest])

	const handleEditClick = () => {
		if (!currentCase) return
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setIsEditing(false)
		setEditedCase({})
		setImmunoReactions(
			existingImmunoRequest
				? existingImmunoRequest.inmunorreacciones
						.split(',')
						.map((r) => r.trim())
						.filter((r) => r)
				: [],
		)
	}

	const handleDeleteClick = () => {
		if (!currentCase) return
		setIsDeleteModalOpen(true)
	}

	const handleConfirmDelete = async () => {
		if (!currentCase || !user) return

		setIsDeleting(true)
		try {
			const { error } = await deleteMedicalRecord(currentCase.id!)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso eliminado exitosamente',
				description: `El caso ${currentCase.code || currentCase.id} ha sido eliminado.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Close modals and panel
			setIsDeleteModalOpen(false)
			onClose()

			// Call onDelete callback if provided
			if (onDelete) {
				onDelete()
			}
		} catch (error) {
			console.error('Error deleting case:', error)
			toast({
				title: '❌ Error al eliminar',
				description: 'Hubo un problema al eliminar el caso. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsDeleting(false)
		}
	}

	const handleInputChange = useCallback((field: string, value: unknown) => {
		setEditedCase((prev: Partial<MedicalRecord>) => ({
			...prev,
			[field]: value,
		}))
	}, [])

	const handleRequestImmunoReactions = async () => {
		if (!case_ || !user || immunoReactions.length === 0) return

		setIsRequestingImmuno(true)
		try {
			const inmunorreaccionesString = immunoReactions.join(',')
			const nReacciones = immunoReactions.length
			const precioUnitario = 18.0
			const total = nReacciones * precioUnitario

			// First, update the ims column in medical_records_clean
			const { error: updateError } = await supabase
				.from('medical_records_clean')
				.update({ ims: inmunorreaccionesString })
				.eq('id', case_.id)

			if (updateError) {
				throw updateError
			}

			// Then, create or update the immuno_requests record
			const { error: upsertError } = await supabase.from('immuno_requests').upsert(
				{
					case_id: case_.id,
					inmunorreacciones: inmunorreaccionesString,
					n_reacciones: nReacciones,
					precio_unitario: precioUnitario,
					total: total,
					pagado: false,
				},
				{
					onConflict: 'case_id',
				},
			)

			if (upsertError) {
				throw upsertError
			}

			// Refetch the immuno request data
			refetchImmunoRequest()

			toast({
				title: '✅ Inmunorreacciones solicitadas',
				description: `Se han solicitado ${nReacciones} inmunorreacciones por un total de $${total.toFixed(2)}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error requesting immuno reactions:', error)
			toast({
				title: '❌ Error al solicitar inmunorreacciones',
				description: 'Hubo un problema al procesar la solicitud. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsRequestingImmuno(false)
		}
	}

	const handleSaveChanges = async () => {
		if (!currentCase || !user) return

		setIsSaving(true)
		try {
			// Detect changes
			const changes = []
			for (const [key, value] of Object.entries(editedCase)) {
				// Skip if value hasn't changed
				if (value === currentCase[key as keyof MedicalRecord]) continue

				// Add to changes array (coerce undefined to null to satisfy types)
				const oldVal = currentCase[key as keyof MedicalRecord]
				const newVal = value as string | number | boolean | null | undefined
				changes.push({
					field: key,
					fieldLabel: getFieldLabel(key),
					oldValue: (oldVal ?? null) as string | number | boolean | null,
					newValue: (newVal ?? null) as string | number | boolean | null,
				})
			}

			if (changes.length === 0) {
				toast({
					title: 'Sin cambios',
					description: 'No se detectaron cambios para guardar.',
					variant: 'default',
				})
				setIsEditing(false)
				setIsSaving(false)
				return
			}

			// Update record with changes
			const { error } = await updateMedicalRecordWithLog(
				currentCase.id!,
				editedCase,
				changes,
				user.id,
				user.email || 'unknown@email.com',
			)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso actualizado exitosamente',
				description: `Se han guardado los cambios al caso ${currentCase.code || currentCase.id}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Refetch the case data to get the updated information
			refetchCaseData()

			// Exit edit mode
			setIsEditing(false)

			// Clear edited case state
			setEditedCase({})

			// Call onSave callback if provided
			if (onSave) {
				onSave()
			}
		} catch (error) {
			console.error('Error updating case:', error)
			toast({
				title: '❌ Error al guardar',
				description: 'Hubo un problema al guardar los cambios. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleAddPayment = () => {
		if (!case_ || !editedCase) return

		// Find the first empty payment slot
		let paymentSlot = 0
		for (let i = 1; i <= 4; i++) {
			const methodKey = `payment_method_${i}` as keyof MedicalRecord
			if (!editedCase[methodKey]) {
				paymentSlot = i
				break
			}
		}

		if (paymentSlot === 0) {
			toast({
				title: '❌ Límite alcanzado',
				description: 'Ya has agregado el máximo de 4 métodos de pago.',
				variant: 'destructive',
			})
			return
		}

		// Add the new payment
		setEditedCase((prev: Partial<MedicalRecord>) => ({
			...prev,
			[`payment_method_${paymentSlot}`]: newPayment.method,
			[`payment_amount_${paymentSlot}`]: parseFloat(newPayment.amount),
			[`payment_reference_${paymentSlot}`]: newPayment.reference,
		}))

		// Reset form and close modal
		setNewPayment({
			method: '',
			amount: '',
			reference: '',
		})
		setIsAddPaymentModalOpen(false)
	}

	const handleRemovePayment = (index: number) => {
		if (!case_ || !editedCase) return

		// Remove the payment
		setEditedCase((prev: Partial<MedicalRecord>) => ({
			...prev,
			[`payment_method_${index}`]: null,
			[`payment_amount_${index}`]: null,
			[`payment_reference_${index}`]: null,
		}))
	}

	const toggleChangelog = () => {
		setIsChangelogOpen(!isChangelogOpen)
		if (!isChangelogOpen && case_?.id) {
			refetchChangelogs()
		}
	}

	const handleSendEmail = () => {
		if (!case_?.email) {
			toast({
				title: '❌ Error',
				description: 'Este caso no tiene un correo electrónico asociado.',
				variant: 'destructive',
			})
			return
		}

		// Create mailto link with case information
		const subject = `Caso ${case_.code || case_.id} - ${case_.full_name}`
		const body =
			`Hola,\n\nAdjunto los detalles del caso:\n\n` +
			`Código: ${case_.code || 'N/A'}\n` +
			`Paciente: ${case_.full_name}\n` +
			`Cédula: ${case_.id_number || 'N/A'}\n` +
			`Teléfono: ${case_.phone || 'N/A'}\n` +
			`Estado: ${case_.payment_status}\n\n` +
			`Saludos cordiales.`

		const mailtoLink = `mailto:${case_.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

		window.open(mailtoLink, '_blank')

		toast({
			title: '📧 Correo preparado',
			description: 'Se ha abierto tu cliente de correo con los detalles del caso.',
		})
	}

	const handleSendWhatsApp = () => {
		if (!case_?.phone) {
			toast({
				title: '❌ Error',
				description: 'Este caso no tiene un número de teléfono asociado.',
				variant: 'destructive',
			})
			return
		}

		// Create WhatsApp message with case information
		const message =
			`Hola, le escribo sobre el caso:\n\n` +
			`Código: ${case_.code || 'N/A'}\n` +
			`Paciente: ${case_.full_name}\n` +
			`Cédula: ${case_.id_number || 'N/A'}\n` +
			`Estado: ${case_.payment_status}\n\n` +
			`¿Podría proporcionarme más información?`

		// Format phone number (remove spaces, dashes, etc.)
		const cleanPhone = case_.phone.replace(/[\s\-\(\)]/g, '')
		const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

		window.open(whatsappLink, '_blank')

		toast({
			title: '📱 WhatsApp abierto',
			description: 'Se ha abierto WhatsApp con los detalles del caso.',
		})
	}

	const getFieldLabel = (field: string): string => {
		const labels: Record<string, string> = {
			full_name: 'Nombre Completo',
			id_number: 'Cédula',
			phone: 'Teléfono',
			email: 'Correo Electrónico',
			edad: 'Edad',
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

	// Función auxiliar para mostrar el símbolo correcto según el método
	const getPaymentSymbol = useCallback((method?: string | null) => {
		if (!method) return ''
		return isVESPaymentMethod(method) ? 'Bs' : '$'
	}, [])

	// Helper para crear inputs de pago con parsing correcto usando calculator handler
	const createPaymentAmountInput = useCallback(
		(field: string, value: number | null | undefined, paymentMethod?: string | null) => {
			const calculatorHandler = createCalculatorInputHandler(value ?? 0, (newValue) =>
				handleInputChange(field, newValue),
			)

			return (
				<>
					<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
						Monto{isVESPaymentMethod(paymentMethod) ? ' (Bs)' : ' ($)'}
					</label>
					<Input
						type="text"
						inputMode="decimal"
						placeholder="0,00"
						value={calculatorHandler.displayValue}
						onKeyDown={calculatorHandler.handleKeyDown}
						onPaste={calculatorHandler.handlePaste}
						onFocus={calculatorHandler.handleFocus}
						onChange={calculatorHandler.handleChange}
						className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50 text-right font-mono"
						autoComplete="off"
					/>
					{isVESPaymentMethod(paymentMethod) && case_?.exchange_rate && value && value > 0 && (
						<p className="text-xs text-green-600 mt-1 font-medium">
							≈ ${convertVEStoUSD(value, case_?.exchange_rate).toFixed(2)} USD
						</p>
					)}
				</>
			)
		},
		[case_?.exchange_rate, handleInputChange],
	)

	const remainingUSD = currentCase?.remaining || 0
	const remainingVES = currentCase?.exchange_rate ? remainingUSD * currentCase.exchange_rate : 0

	// Get action type display text and icon for changelog
	const getActionTypeInfo = useCallback((log: ChangeLogEntry) => {
		if (log.field_name === 'created_record') {
			return {
				text: 'Creación',
				icon: <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />,
				bgColor: 'bg-green-100 dark:bg-green-900/30',
				textColor: 'text-green-800 dark:text-green-300',
			}
		} else if (log.field_name === 'deleted_record') {
			return {
				text: 'Eliminación',
				icon: <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />,
				bgColor: 'bg-red-100 dark:bg-red-900/30',
				textColor: 'text-red-800 dark:text-red-300',
			}
		} else {
			return {
				text: 'Edición',
				icon: <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
				bgColor: 'bg-blue-100 dark:bg-blue-900/30',
				textColor: 'text-blue-800 dark:text-blue-300',
			}
		}
	}, [])

	// Check if this is an immunohistochemistry case
	const isImmunoCase = case_?.exam_type?.toLowerCase().includes('inmuno')
	const isAdmin = profile?.role === 'admin'
	const canEditImmuno = isAdmin && isImmunoCase

	// (removed inline InfoRow; now using top-level memoized InfoRow)

	// Memoize the InfoSection component
	const InfoSection = useCallback(
		({
			title,
			icon: Icon,
			children,
		}: {
			title: string
			icon: React.ComponentType<{ className?: string }>
			children: React.ReactNode
		}) => (
			<div className="bg-white/60 dark:bg-background/30 backdrop-blur-[5px] rounded-lg p-4 border border-input shadow-sm hover:shadow-md transition-shadow duration-200">
				<div className="flex items-center gap-2 mb-3">
					<Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
				</div>
				{children}
			</div>
		),
		[],
	)

	const getStatusColor = (status: string) => {
		const normalized = (status || '').toString().trim().toLowerCase()
		switch (normalized) {
			case 'pagado':
			case 'completado':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'en proceso':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			case 'pendiente':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			case 'cancelado':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
			case 'incompleto':
			default:
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
		}
	}

	if (!currentCase) return null

	const handleRedirectToPDF = async (caseId: string) => {
		if (!caseId) {
			toast({
				title: '❌ Error',
				description: 'No se encontró el ID del caso.',
				variant: 'destructive',
			})
			return
		}

		try {
			const { data, error } = await supabase
				.from('medical_records_clean')
				.select('informe_qr, code, full_name')
				.eq('id', caseId)
				.single<MedicalRecord>()

			if (error) {
				console.error('Error obteniendo informe_qr:', error)
				toast({
					title: '❌ Error',
					description: 'No se pudo obtener el PDF. Intenta nuevamente.',
					variant: 'destructive',
				})
				return
			}

			if (!data?.informe_qr) {
				toast({
					title: '📄 Sin PDF disponible',
					description: 'Este caso aún no tiene un documento generado.',
					variant: 'destructive',
				})
				return
			}

			// Descargar el archivo directamente usando fetch
			const response = await fetch(data.informe_qr)
			if (!response.ok) {
				throw new Error(`Error al descargar: ${response.status}`)
			}

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url

			const caseCode = data.code || caseId
			const fileName = `${caseCode}.pdf`
			link.download = fileName

			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url) // Limpiar memoria
		} catch (err) {
			console.error('Error al intentar redirigir al PDF:', err)
			toast({
				title: '❌ Error inesperado',
				description: 'Hubo un problema al abrir el documento.',
				variant: 'destructive',
			})
		}
	}

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							viewport={{ margin: '0px' }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={isEditing ? undefined : onClose}
							className="fixed inset-0 bg-black/50 z-[99999998]"
						/>

						{/* Panel */}
						<motion.div
							viewport={{ margin: '0px' }}
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 200 }}
							className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white/80 dark:bg-background/50 backdrop-blur-[2px] dark:backdrop-blur-[10px] shadow-2xl z-[99999999] overflow-y-auto rounded-lg border-l border-input"
						>
							<div className="sticky top-0 bg-white/50 dark:bg-background/50 backdrop-blur-[2px] dark:backdrop-blur-[10px] border-b border-input p-3 sm:p-6 z-10">
								<div className="flex items-center justify-between">
									<div>
										<div>
											<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
												Detalles Del Caso
											</h2>
										</div>
										<div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
											{currentCase.code && (
												<span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
													{currentCase.code}
												</span>
											)}
											<span
												className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(
													currentCase.payment_status,
												)}`}
											>
												{currentCase.payment_status}
											</span>
											{currentCase.informe_qr && (
												<button
													onClick={() => handleRedirectToPDF(currentCase.id)}
													className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
												>
													<Download className="w-4 h-4" />
													Descargar PDF
												</button>
											)}
										</div>
										{/* Action Buttons */}
										<div className="flex gap-2 mt-4">
											{isEditing ? (
												<>
													<button
														onClick={handleSaveChanges}
														disabled={isSaving}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
													>
														{isSaving ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																Guardando...
															</>
														) : (
															<>
																<Save className="w-4 h-4" />
																Guardar Cambios
															</>
														)}
													</button>
													<button
														onClick={handleCancelEdit}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
														disabled={isSaving}
													>
														<XCircle className="w-4 h-4" />
														Cancelar
													</button>
												</>
											) : (
												<>
													<button
														onClick={handleEditClick}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
													>
														<Edit className="w-4 h-4" />
														Editar
													</button>
													<button
														onClick={toggleChangelog}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
													>
														<History className="w-4 h-4" />
														{isChangelogOpen ? 'Ocultar' : 'Historial'}
													</button>
													<button
														onClick={handleSendEmail}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
													>
														<Send className="w-4 h-4" />
														Correo
													</button>
													<button
														onClick={handleSendWhatsApp}
														className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
													>
														<WhatsAppIcon className="w-4 h-4" />
														WhatsApp
													</button>
												</>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={onClose}
											className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-none"
										>
											<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
										</button>
									</div>
								</div>
							</div>

							{/* Content */}
							<div className="p-4 sm:p-6 space-y-6">
								<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
									<p className="text-teal-400 text-sm">
										Este caso fue creado por{' '}
										<span className="font-semibold">
											{creatorData?.displayName || currentCase.created_by_display_name || 'Usuario del sistema'}
										</span>
										el {format(new Date(currentCase.created_at), 'dd/MM/yyyy', { locale: es })}
									</p>
								</div>
								{/* Immunohistochemistry Section - Only for admin users and immuno cases */}
								{canEditImmuno && (
									<InfoSection title="Inmunorreacciones" icon={Stethoscope}>
										<div className="space-y-4">
											<div>
												<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
													Agregar Inmunorreacciones
												</label>
												<TagInput
													value={immunoReactions}
													onChange={setImmunoReactions}
													placeholder="Escribir inmunorreacción y presionar Enter (ej: RE, RP, CERB2)"
													className="w-full"
													disabled={isRequestingImmuno}
												/>
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
													Escribe cada inmunorreacción y presiona Enter para agregarla como etiqueta
												</p>
											</div>

											{existingImmunoRequest && (
												<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
													<h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Solicitud Existente</h4>
													<div className="grid grid-cols-2 gap-2 text-sm">
														<div>
															<span className="text-blue-700 dark:text-blue-400">Inmunorreacciones:</span>
															<p className="font-medium">{existingImmunoRequest.inmunorreacciones}</p>
														</div>
														<div>
															<span className="text-blue-700 dark:text-blue-400">Cantidad:</span>
															<p className="font-medium">{existingImmunoRequest.n_reacciones}</p>
														</div>
														<div>
															<span className="text-blue-700 dark:text-blue-400">Precio Unitario:</span>
															<p className="font-medium">${existingImmunoRequest.precio_unitario}</p>
														</div>
														<div>
															<span className="text-blue-700 dark:text-blue-400">Total:</span>
															<p className="font-medium">${existingImmunoRequest.total}</p>
														</div>
														<div className="col-span-2">
															<span className="text-blue-700 dark:text-blue-400">Estado:</span>
															<span
																className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
																	existingImmunoRequest.pagado
																		? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
																		: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
																}`}
															>
																{existingImmunoRequest.pagado ? 'Pagado' : 'Pendiente de pago'}
															</span>
														</div>
													</div>
												</div>
											)}

											{immunoReactions.length > 0 && (
												<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
													<div>
														<p className="text-sm font-medium">
															{immunoReactions.length} inmunorreacciones seleccionadas
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															Total estimado: ${(immunoReactions.length * 18).toFixed(2)}
														</p>
													</div>
													<Button
														onClick={handleRequestImmunoReactions}
														disabled={isRequestingImmuno || immunoReactions.length === 0}
														className="bg-orange-600 hover:bg-orange-700 text-white"
													>
														{isRequestingImmuno ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Solicitando...
															</>
														) : (
															<>
																<Send className="w-4 h-4 mr-2" />
																Solicitar inmunorreacciones
															</>
														)}
													</Button>
												</div>
											)}
										</div>
									</InfoSection>
								)}

								{/* Changelog Section */}
								{isChangelogOpen && !isEditing && (
									<InfoSection title="Historial de Cambios" icon={History}>
										{isLoadingChangelogs ? (
											<div className="flex items-center justify-center p-4">
												<Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
												<span>Cargando historial...</span>
											</div>
										) : !changelogsData?.data || changelogsData.data.length === 0 ? (
											<div className="text-center p-4">
												<p className="text-gray-500 dark:text-gray-400">No hay registros de cambios para este caso.</p>
											</div>
										) : (
											<div className="space-y-4 max-h-80 overflow-y-auto">
												{changelogsData.data.map((log: ChangeLogEntry) => {
													const actionInfo = getActionTypeInfo(log)
													return (
														<div
															key={log.id}
															className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
														>
															<div className="flex justify-between items-start mb-2">
																<div
																	className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${actionInfo.bgColor} ${actionInfo.textColor}`}
																>
																	{actionInfo.icon}
																	<span>{actionInfo.text}</span>
																</div>
																<div className="text-xs text-gray-500 dark:text-gray-400">
																	{format(new Date(log.changed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
																</div>
															</div>
															<div className="flex items-center gap-2 mb-2">
																<span className="text-sm">{log.user_email}</span>
															</div>
															{log.field_name === 'created_record' ? (
																<p className="text-sm">Creación de nuevo registro médico</p>
															) : log.field_name === 'deleted_record' ? (
																<p className="text-sm">Eliminación del registro: {log.old_value}</p>
															) : (
																<div>
																	<p className="text-sm font-medium">{log.field_label}</p>
																	<div className="flex items-center gap-2 mt-1 text-sm">
																		<span className="line-through text-gray-500 dark:text-gray-400">
																			{log.old_value || '(vacío)'}
																		</span>
																		<span className="text-xs">→</span>
																		<span className="text-green-600 dark:text-green-400">
																			{log.new_value || '(vacío)'}
																		</span>
																	</div>
																</div>
															)}
														</div>
													)
												})}
											</div>
										)}
									</InfoSection>
								)}

								{/* Patient Information */}
								<InfoSection title="Información del Paciente" icon={User}>
									<div className="space-y-1">
										<InfoRow
											label="Nombre completo"
											value={currentCase.full_name}
											field="full_name"
											isEditing={isEditing}
											editedValue={editedCase.full_name ?? null}
											onChange={handleInputChange}
										/>
										<InfoRow
											label="Cédula"
											value={currentCase.id_number}
											field="id_number"
											isEditing={isEditing}
											editedValue={editedCase.id_number ?? null}
											onChange={handleInputChange}
										/>
										{/* Edad: input numérico + dropdown (AÑOS/MESES) */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Edad:</span>
											{isEditing ? (
												<div className="sm:w-1/2 grid grid-cols-2 gap-2">
													{(() => {
														const parsed = parseEdad((editedCase.edad ?? currentCase.edad) as string | null)
														const ageValue = parsed.value
														const ageUnit = parsed.unit
														return (
															<>
																<Input
																	type="number"
																	placeholder="0"
																	value={ageValue === '' ? '' : ageValue}
																	min={0}
																	max={150}
																	onChange={(e) => {
																		const newValue = e.target.value
																		const numeric = newValue === '' ? '' : Number(newValue)
																		const unitToUse = ageUnit || 'AÑOS'
																		const newEdad = newValue === '' ? null : `${numeric} ${unitToUse}`
																		handleInputChange('edad', newEdad)
																	}}
																	className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
																/>
																<CustomDropdown
																	options={createDropdownOptions(['MESES', 'AÑOS'])}
																	value={ageUnit || 'AÑOS'}
																	onChange={(newUnit) => {
																		const parsedNow = parseEdad((editedCase.edad ?? currentCase.edad) as string | null)
																		const valueNow = parsedNow.value
																		const valueToUse = valueNow === '' ? '' : valueNow
																		const newEdad = valueToUse === '' ? null : `${valueToUse} ${newUnit}`
																		handleInputChange('edad', newEdad)
																	}}
																	placeholder="Unidad"
																	className="text-sm"
																	direction="auto"
																/>
															</>
														)
													})()}
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.edad || 'Sin edad'}
												</span>
											)}
										</div>
										<InfoRow
											label="Teléfono"
											value={currentCase.phone}
											field="phone"
											isEditing={isEditing}
											editedValue={editedCase.phone ?? null}
											onChange={handleInputChange}
										/>
										<InfoRow
											label="Email"
											value={currentCase.email || 'N/A'}
											field="email"
											type="email"
											isEditing={isEditing}
											editedValue={editedCase.email ?? null}
											onChange={handleInputChange}
										/>
										<InfoRow label="Relación" value={currentCase.relationship || 'N/A'} editable={false} />
									</div>
								</InfoSection>

								{/* Medical Information */}
								<InfoSection title="Información Médica" icon={Stethoscope}>
									<div className="space-y-1">
										{/* Estudio - Dropdown */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudio:</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<CustomDropdown
														options={createDropdownOptions([
															{ value: 'Inmunohistoquímica', label: 'Inmunohistoquímica' },
															{ value: 'Biopsia', label: 'Biopsia' },
															{ value: 'Citología', label: 'Citología' },
														])}
														value={editedCase.exam_type || currentCase.exam_type || ''}
														onChange={(value) => handleInputChange('exam_type', value)}
														placeholder="Seleccione una opción"
														className="text-sm"
														direction="auto"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.exam_type || 'N/A'}
												</span>
											)}
										</div>

										{/* Médico Tratante - Autocompletado */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Médico tratante:</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<AutocompleteInput
														fieldName="treatingDoctor"
														placeholder="Nombre del Médico"
														value={editedCase.treating_doctor || currentCase.treating_doctor || ''}
														onChange={(e) => {
															const { value } = e.target
															if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
																handleInputChange('treating_doctor', value)
															}
														}}
														className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.treating_doctor || 'N/A'}
												</span>
											)}
										</div>

										{/* Procedencia - Autocompletado */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Procedencia:</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<AutocompleteInput
														fieldName="origin"
														placeholder="Hospital o Clínica"
														value={editedCase.origin || currentCase.origin || ''}
														onChange={(e) => {
															const { value } = e.target
															if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
																handleInputChange('origin', value)
															}
														}}
														className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.origin || 'N/A'}
												</span>
											)}
										</div>

										{/* Sede - Dropdown */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sede:</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<CustomDropdown
														options={createDropdownOptions(['PMG', 'CPC', 'CNX', 'STX', 'MCY'])}
														value={editedCase.branch || currentCase.branch || ''}
														onChange={(value) => handleInputChange('branch', value)}
														placeholder="Seleccione una sede"
														className="text-sm"
														direction="auto"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.branch || 'N/A'}
												</span>
											)}
										</div>

										{/* Muestra - Autocompletado */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Muestra:</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<AutocompleteInput
														fieldName="sampleType"
														placeholder="Ej: Biopsia de Piel"
														value={editedCase.sample_type || currentCase.sample_type || ''}
														onChange={(e) => {
															const { value } = e.target
															if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
																handleInputChange('sample_type', value)
															}
														}}
														className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.sample_type || 'N/A'}
												</span>
											)}
										</div>

										{/* Cantidad de muestras - Numérico */}
										<div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 rounded px-2 -mx-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
												Cantidad de muestras:
											</span>
											{isEditing ? (
												<div className="sm:w-1/2">
													<Input
														type="number"
														placeholder="0"
														value={
															editedCase.number_of_samples !== undefined
																? editedCase.number_of_samples
																: currentCase.number_of_samples || ''
														}
														onChange={(e) => {
															const value = e.target.value
															handleInputChange('number_of_samples', value === '' ? 0 : Number(value))
														}}
														className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
													/>
												</div>
											) : (
												<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
													{currentCase.number_of_samples || 'N/A'}
												</span>
											)}
										</div>

										{/* Fecha de registro - NO EDITABLE */}
										<InfoRow
											label="Fecha de registro"
											value={new Date(currentCase.date || '').toLocaleDateString('es-ES')}
											editable={false}
										/>
									</div>
								</InfoSection>

								{/* Financial Information */}
								<InfoSection title="Información Financiera" icon={CreditCard}>
									<div className="space-y-1">
										<InfoRow
											label="Monto total"
											value={`$${currentCase.total_amount.toLocaleString()}`}
											editable={false}
										/>
										<InfoRow label="Tasa de cambio" value={currentCase.exchange_rate?.toFixed(2)} editable={false} />
									</div>

									{currentCase.remaining > 0 && (
										<div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg border border-red-200 dark:border-red-800">
											<div className="flex items-center gap-1.5 sm:gap-2">
												<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
												<p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
													Monto pendiente: ${remainingUSD.toLocaleString()} - Bs. {remainingVES.toLocaleString()}
												</p>
											</div>
										</div>
									)}

									{/* Payment Methods */}
									<div className="mt-4">
										<div className="flex items-center justify-between mb-2">
											<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Formas de Pago:</h4>
											{isEditing && (
												<Button
													size="sm"
													variant="outline"
													onClick={() => setIsAddPaymentModalOpen(true)}
													className="text-xs flex items-center gap-1"
													disabled={
														!!editedCase.payment_method_1 &&
														!!editedCase.payment_method_2 &&
														!!editedCase.payment_method_3 &&
														!!editedCase.payment_method_4
													}
												>
													<Plus className="w-3 h-3" />
													Agregar Método
												</Button>
											)}
										</div>
										<div className="space-y-2">
											{/* Payment Method 1 */}
											{(currentCase.payment_method_1 || (isEditing && editedCase.payment_method_1)) && (
												<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 relative transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
													{isEditing ? (
														<>
															<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Método
																	</label>
																	<CustomDropdown
																		options={createDropdownOptions([
																			'Punto de venta',
																			'Dólares en efectivo',
																			'Zelle',
																			'Pago móvil',
																			'Bs en efectivo',
																		])}
																		value={editedCase.payment_method_1 || ''}
																		onChange={(value) => handleInputChange('payment_method_1', value)}
																		placeholder="Seleccionar método"
																		className="text-sm"
																		direction="auto"
																	/>
																</div>
																<div>
																	{createPaymentAmountInput(
																		'payment_amount_1',
																		editedCase.payment_amount_1,
																		editedCase.payment_method_1,
																	)}
																</div>
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Referencia
																	</label>
																	<Input
																		value={editedCase.payment_reference_1 || ''}
																		onChange={(e) => handleInputChange('payment_reference_1', e.target.value)}
																		className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
																	/>
																</div>
															</div>
															<button
																onClick={() => handleRemovePayment(1)}
																className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110"
															>
																<XCircle className="w-4 h-4" />
															</button>
														</>
													) : (
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-2">
																<CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
																<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{currentCase.payment_method_1}
																</span>
															</div>
															<span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
																{getPaymentSymbol(currentCase.payment_method_1)}{' '}
																{currentCase.payment_amount_1?.toLocaleString('es-VE', {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																})}
															</span>
														</div>
													)}
													{(currentCase.payment_reference_1 || (isEditing && editedCase.payment_reference_1)) &&
														!isEditing && (
															<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
																<Hash className="w-3 h-3" />
																Ref: {editedCase.payment_reference_1 || currentCase.payment_reference_1}
															</div>
														)}
												</div>
											)}

											{/* Payment Method 2 */}
											{(currentCase.payment_method_2 || (isEditing && editedCase.payment_method_2)) && (
												<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 relative transition-all duration-200 hover:shadow-md hover:border-green-300 dark:hover:border-green-600">
													{isEditing ? (
														<>
															<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Método
																	</label>
																	<CustomDropdown
																		options={createDropdownOptions([
																			'Punto de venta',
																			'Dólares en efectivo',
																			'Zelle',
																			'Pago móvil',
																			'Bs en efectivo',
																		])}
																		value={editedCase.payment_method_2 || ''}
																		onChange={(value) => handleInputChange('payment_method_2', value)}
																		placeholder="Seleccionar método"
																		className="text-sm"
																		direction="auto"
																	/>
																</div>
																<div>
																	{createPaymentAmountInput(
																		'payment_amount_2',
																		editedCase.payment_amount_2,
																		editedCase.payment_method_2,
																	)}
																</div>
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Referencia
																	</label>
																	<Input
																		value={editedCase.payment_reference_2 || ''}
																		onChange={(e) => handleInputChange('payment_reference_2', e.target.value)}
																		className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
																	/>
																</div>
															</div>
															<button
																onClick={() => handleRemovePayment(2)}
																className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110"
															>
																<XCircle className="w-4 h-4" />
															</button>
														</>
													) : (
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-2">
																<CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
																<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{currentCase.payment_method_2}
																</span>
															</div>
															<span className="text-lg font-bold text-green-600 dark:text-green-400 font-mono">
																{getPaymentSymbol(currentCase.payment_method_2)}{' '}
																{currentCase.payment_amount_2?.toLocaleString('es-VE', {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																})}
															</span>
														</div>
													)}
													{(currentCase.payment_reference_2 || (isEditing && editedCase.payment_reference_2)) &&
														!isEditing && (
															<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
																<Hash className="w-3 h-3" />
																Ref: {editedCase.payment_reference_2 || currentCase.payment_reference_2}
															</div>
														)}
												</div>
											)}

											{/* Payment Method 3 */}
											{(currentCase.payment_method_3 || (isEditing && editedCase.payment_method_3)) && (
												<div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 relative transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600">
													{isEditing ? (
														<>
															<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Método
																	</label>
																	<CustomDropdown
																		options={createDropdownOptions([
																			'Punto de venta',
																			'Dólares en efectivo',
																			'Zelle',
																			'Pago móvil',
																			'Bs en efectivo',
																		])}
																		value={editedCase.payment_method_3 || ''}
																		onChange={(value) => handleInputChange('payment_method_3', value)}
																		placeholder="Seleccionar método"
																		className="text-sm"
																		direction="auto"
																	/>
																</div>
																<div>
																	{createPaymentAmountInput(
																		'payment_amount_3',
																		editedCase.payment_amount_3,
																		editedCase.payment_method_3,
																	)}
																</div>
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Referencia
																	</label>
																	<Input
																		value={editedCase.payment_reference_3 || ''}
																		onChange={(e) => handleInputChange('payment_reference_3', e.target.value)}
																		className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
																	/>
																</div>
															</div>
															<button
																onClick={() => handleRemovePayment(3)}
																className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110"
															>
																<XCircle className="w-4 h-4" />
															</button>
														</>
													) : (
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-2">
																<CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
																<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{currentCase.payment_method_3}
																</span>
															</div>
															<span className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">
																{getPaymentSymbol(currentCase.payment_method_3)}{' '}
																{currentCase.payment_amount_3?.toLocaleString('es-VE', {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																})}
															</span>
														</div>
													)}
													{(currentCase.payment_reference_3 || (isEditing && editedCase.payment_reference_3)) &&
														!isEditing && (
															<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
																<Hash className="w-3 h-3" />
																Ref: {editedCase.payment_reference_3 || currentCase.payment_reference_3}
															</div>
														)}
												</div>
											)}

											{/* Payment Method 4 */}
											{(currentCase.payment_method_4 || (isEditing && editedCase.payment_method_4)) && (
												<div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700 relative transition-all duration-200 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600">
													{isEditing ? (
														<>
															<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Método
																	</label>
																	<CustomDropdown
																		options={createDropdownOptions([
																			'Punto de venta',
																			'Dólares en efectivo',
																			'Zelle',
																			'Pago móvil',
																			'Bs en efectivo',
																		])}
																		value={editedCase.payment_method_4 || ''}
																		onChange={(value) => handleInputChange('payment_method_4', value)}
																		placeholder="Seleccionar método"
																		className="text-sm"
																		direction="auto"
																	/>
																</div>
																<div>
																	{createPaymentAmountInput(
																		'payment_amount_4',
																		editedCase.payment_amount_4,
																		editedCase.payment_method_4,
																	)}
																</div>
																<div>
																	<label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
																		Referencia
																	</label>
																	<Input
																		value={editedCase.payment_reference_4 || ''}
																		onChange={(e) => handleInputChange('payment_reference_4', e.target.value)}
																		className="text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
																	/>
																</div>
															</div>
															<button
																onClick={() => handleRemovePayment(4)}
																className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110"
															>
																<XCircle className="w-4 h-4" />
															</button>
														</>
													) : (
														<div className="flex justify-between items-center">
															<div className="flex items-center gap-2">
																<CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
																<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
																	{currentCase.payment_method_4}
																</span>
															</div>
															<span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
																{getPaymentSymbol(currentCase.payment_method_4)}{' '}
																{currentCase.payment_amount_4?.toLocaleString('es-VE', {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																})}
															</span>
														</div>
													)}
													{(currentCase.payment_reference_4 || (isEditing && editedCase.payment_reference_4)) &&
														!isEditing && (
															<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
																<Hash className="w-3 h-3" />
																Ref: {editedCase.payment_reference_4 || currentCase.payment_reference_4}
															</div>
														)}
												</div>
											)}
										</div>
									</div>
								</InfoSection>

								{/* Additional Information */}
								<InfoSection title="Información Adicional" icon={FileText}>
									<div className="space-y-1">
										<InfoRow
											label="Fecha de creación"
											value={new Date(currentCase.created_at || '').toLocaleDateString('es-ES')}
											editable={false}
										/>
										<InfoRow
											label="Última actualización"
											value={new Date(currentCase.updated_at || '').toLocaleDateString('es-ES')}
											editable={false}
										/>
										<div className="py-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios:</span>
											{isEditing ? (
												<Textarea
													value={editedCase.comments || ''}
													onChange={(e) => handleInputChange('comments', e.target.value)}
													className="mt-1 w-full min-h-[100px] text-sm border-dashed focus:border-primary focus:ring-primary bg-gray-50 dark:bg-gray-800/50"
													placeholder="Agregar comentarios adicionales..."
												/>
											) : (
												<p className="text-sm text-gray-900 dark:text-gray-100 mt-1 p-3 bg-white dark:bg-background rounded border">
													{currentCase.comments || 'Sin comentarios'}
												</p>
											)}
										</div>
									</div>
								</InfoSection>

								{/* Bottom Action Buttons */}
								<div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
									<button
										onClick={handleDeleteClick}
										className="flex items-center justify-center gap-1 px-3 py-2 text-lg font-semibold rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 w-full text-center"
									>
										<Trash2 className="size-5" />
										Eliminar
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Modal */}
			{isDeleteModalOpen && (
				<div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-black/50">
					<div className="bg-white/90 dark:bg-background/70 backdrop-blur-[10px] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-input">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
								<AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar eliminación</h3>
						</div>

						<p className="text-gray-700 dark:text-gray-300 mb-6">
							¿Estás seguro de que quieres eliminar este caso? Esta acción no se puede deshacer.
						</p>

						<div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
							<button
								onClick={() => setIsDeleteModalOpen(false)}
								className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-none"
							>
								Cancelar
							</button>
							<button
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-none flex items-center justify-center gap-2"
							>
								{isDeleting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Eliminando...</span>
									</>
								) : (
									<>
										<Trash2 className="w-4 h-4" />
										<span>Confirmar</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add Payment Modal */}
			{isAddPaymentModalOpen && (
				<div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-black/50">
					<div className="bg-white/90 dark:bg-background/70 backdrop-blur-[10px] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-input">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agregar Método de Pago</h3>
							</div>
							<button
								onClick={() => setIsAddPaymentModalOpen(false)}
								className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-none"
							>
								<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
							</button>
						</div>

						<div className="space-y-4 mb-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Método de Pago
								</label>
								<CustomDropdown
									options={createDropdownOptions([
										'Punto de venta',
										'Dólares en efectivo',
										'Zelle',
										'Pago móvil',
										'Bs en efectivo',
									])}
									value={newPayment.method}
									onChange={(value) => setNewPayment({ ...newPayment, method: value })}
									placeholder="Seleccionar método"
									className="w-full"
									direction="auto"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Monto{isVESPaymentMethod(newPayment.method) ? ' (Bs)' : ' ($)'}
								</label>
								{(() => {
									const calculatorHandler = createCalculatorInputHandler(
										parseDecimalNumber(newPayment.amount) || 0,
										(newValue) => setNewPayment({ ...newPayment, amount: newValue.toString() }),
									)

									return (
										<Input
											type="text"
											inputMode="decimal"
											value={calculatorHandler.displayValue}
											onKeyDown={calculatorHandler.handleKeyDown}
											onPaste={calculatorHandler.handlePaste}
											onFocus={calculatorHandler.handleFocus}
											onChange={calculatorHandler.handleChange}
											placeholder="0,00"
											className="text-right font-mono"
											autoComplete="off"
										/>
									)
								})()}
								{isVESPaymentMethod(newPayment.method) &&
									currentCase?.exchange_rate &&
									parseDecimalNumber(newPayment.amount) > 0 && (
										<p className="text-xs text-green-600 mt-1 font-medium">
											≈ ${convertVEStoUSD(parseDecimalNumber(newPayment.amount), currentCase.exchange_rate).toFixed(2)}{' '}
											USD
										</p>
									)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referencia</label>
								<Input
									value={newPayment.reference}
									onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
									placeholder="Referencia de pago"
								/>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
							<Button variant="outline" onClick={() => setIsAddPaymentModalOpen(false)}>
								Cancelar
							</Button>
							<Button
								onClick={handleAddPayment}
								disabled={!newPayment.method || !newPayment.amount}
								className="bg-primary hover:bg-primary/80"
							>
								Agregar Pago
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	)
})

export default UnifiedCaseModal
