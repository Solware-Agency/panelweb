import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Microscope, Loader2, Heart, Activity } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { TagInput } from '@shared/components/ui/tag-input'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { updateMedicalRecordWithLog, createOrUpdateImmunoRequest } from '@lib/supabase-service'
import type { MedicalRecord } from '@lib/supabase-service'

interface GenerateCaseModalProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

const RequestCaseModal: React.FC<GenerateCaseModalProps> = ({ case_, isOpen, onClose, onSuccess }) => {
	const [isSaving, setIsSaving] = useState(false)
	const [inmunorreacciones, setInmunorreacciones] = useState<string[]>([])
	const [isRequestingImmuno, setIsRequestingImmuno] = useState(false)
	const { toast } = useToast()
	const { user } = useAuth()
	const { profile } = useUserProfile()

	// Determine case type from exam_type
	const getCaseType = (examType: string): 'biopsia' | 'inmunohistoquimica' | 'citologia' => {
		const type = examType.toLowerCase().trim()
		if (type.includes('inmuno')) return 'inmunohistoquimica'
		if (type.includes('citolog')) return 'citologia'
		return 'biopsia'
	}

	const caseType = case_ ? getCaseType(case_.exam_type) : 'biopsia'

	const handleRequestImmunoreactions = async () => {
		if (!case_ || !user || inmunorreacciones.length === 0) {
			toast({
				title: '❌ Error',
				description: 'Debe agregar al menos una inmunorreacción.',
				variant: 'destructive',
			})
			return
		}

		setIsRequestingImmuno(true)

		try {
			// 1. Actualizar la columna ims en medical_records_clean
			const imsString = inmunorreacciones.join(',')
			const { error: updateError } = await updateMedicalRecordWithLog(
				case_.id!,
				{ ims: imsString },
				[
					{
						field: 'ims',
						fieldLabel: 'Inmunorreacciones Solicitadas',
						oldValue: case_.ims || null,
						newValue: imsString,
					},
				],
				user.id,
				user.email || 'unknown@email.com',
			)

			if (updateError) {
				throw updateError
			}

			// 2. Crear/actualizar registro en immuno_requests
			const { error: immunoError } = await createOrUpdateImmunoRequest(
				case_.id!,
				inmunorreacciones,
				18.0, // Precio unitario por defecto
			)

			if (immunoError) {
				throw immunoError
			}

			toast({
				title: '✅ Inmunorreacciones solicitadas',
				description: `Se han solicitado ${inmunorreacciones.length} inmunorreacciones para este caso.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Limpiar las inmunorreacciones del estado local
			setInmunorreacciones([])

			// Actualizar el caso en el estado padre
			onSuccess()
		} catch (error) {
			console.error('Error requesting immunoreactions:', error)
			toast({
				title: '❌ Error al solicitar inmunorreacciones',
				description: 'Hubo un problema al procesar la solicitud. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsRequestingImmuno(false)
		}
	}

	const getCaseTypeIcon = (type: string) => {
		switch (type) {
			case 'inmunohistoquimica':
				return <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
			case 'citologia':
				return <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
			default:
				return <Microscope className="w-5 h-5 text-green-600 dark:text-green-400" />
		}
	}

	const getCaseTypeTitle = (type: string) => {
		switch (type) {
			case 'inmunohistoquimica':
				return 'Inmunohistoquímica'
			case 'citologia':
				return 'Citología'
			default:
				return 'Biopsia'
		}
	}

	if (!case_) return null

	const handleTransformToPDF = async () => {
		if (!case_?.id) {
			toast({
				title: '❌ Error',
				description: 'No se encontró el ID del caso.',
				variant: 'destructive',
			})
			return
		}

		try {
			setIsSaving(true)

			console.log('Sending request to n8n webhook with case ID:', case_.id)

			const requestBody = {
				caseId: case_.id,
			}

			console.log('Request body:', requestBody)

			const response = await fetch(
				'https://solwareagencia.app.n8n.cloud/webhook-test/7c840100-fd50-4598-9c48-c7ce60f82506',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify(requestBody),
				},
			)

			console.log('Response status:', response.status)

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`

				try {
					const errorData = await response.text()
					console.log('Error response body:', errorData)
					errorMessage += ` - ${errorData}`
				} catch (e) {
					console.log('Could not read error response body', e)
				}

				throw new Error(errorMessage)
			}

			// Try to parse the response
			let responseData
			try {
				responseData = await response.json()
				console.log('Success response:', responseData)
			} catch (e) {
				responseData = await response.text()
				console.log('Success response (text):', responseData, e)
			}

			toast({
				title: '✅ Flujo activado',
				description: 'El flujo de n8n ha sido activado exitosamente.',
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error in handleGenerateCase:', error)

			let errorMessage = 'Hubo un problema al activar el flujo.'

			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				errorMessage =
					'No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.'
			} else if (error instanceof Error && error.message.includes('CORS')) {
				errorMessage = 'Error de configuración del servidor (CORS). Contacta al administrador.'
			} else if (error instanceof Error && error.message.includes('HTTP')) {
				errorMessage = `Error del servidor: ${error.message}`
			}

			toast({
				title: '❌ Error al activar flujo',
				description: errorMessage,
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleGenerateCase = async () => {
		if (!case_?.id) {
			toast({
				title: '❌ Error',
				description: 'No se encontró el ID del caso.',
				variant: 'destructive',
			})
			return
		}

		try {
			setIsSaving(true)

			console.log('Sending request to n8n webhook with case ID:', case_.id)

			const requestBody = {
				caseId: case_.id,
			}

			console.log('Request body:', requestBody)

			const response = await fetch(
				'https://solwareagencia.app.n8n.cloud/webhook-test/7c840100-fd50-4598-9c48-c7ce60f82506',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify(requestBody),
				},
			)

			console.log('Response status:', response.status)

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`

				try {
					const errorData = await response.text()
					console.log('Error response body:', errorData)
					errorMessage += ` - ${errorData}`
				} catch (e) {
					console.log('Could not read error response body', e)
				}

				throw new Error(errorMessage)
			}

			// Try to parse the response
			let responseData
			try {
				responseData = await response.json()
				console.log('Success response:', responseData)
			} catch (e) {
				responseData = await response.text()
				console.log('Success response (text):', responseData, e)
			}

			toast({
				title: '✅ Flujo activado',
				description: 'El flujo de n8n ha sido activado exitosamente.',
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error in handleGenerateCase:', error)

			let errorMessage = 'Hubo un problema al activar el flujo.'

			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				errorMessage =
					'No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.'
			} else if (error instanceof Error && error.message.includes('CORS')) {
				errorMessage = 'Error de configuración del servidor (CORS). Contacta al administrador.'
			} else if (error instanceof Error && error.message.includes('HTTP')) {
				errorMessage = `Error del servidor: ${error.message}`
			}

			toast({
				title: '❌ Error al activar flujo',
				description: errorMessage,
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
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
						className="fixed inset-0 bg-black/50 z-[999999998]"
					/>

					{/* Main Modal */}
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-background shadow-2xl z-[999999999] overflow-y-auto border-l border-input flex flex-col"
					>
						{/* Header */}
						<div className="sticky top-0 bg-white dark:bg-background border-b border-gray-200 dark:border-gray-700 p-3 sm:p-6 z-10">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
										{getCaseTypeIcon(caseType)}
										Generar Caso de {getCaseTypeTitle(caseType)}
									</h2>
									<div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
										<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
											{case_.code || case_.id?.slice(-6).toUpperCase()}
										</p>
										<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">• {case_.full_name}</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
								</button>
							</div>
						</div>

						{/* Content */}
						<div className="p-3 sm:p-6 overflow-y-auto flex-1">
							<div className="space-y-4 sm:space-y-6">
								{/* Case Type Indicator */}
								<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
									<div className="flex items-center gap-2">
										{getCaseTypeIcon(caseType)}
										<span className="font-medium text-blue-800 dark:text-blue-300">
											Tipo de caso: {getCaseTypeTitle(caseType)}
										</span>
									</div>
								</div>

								{/* Dynamic Content Based on Case Type */}
								{caseType === 'biopsia' && (
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Biopsia</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">Configuración para casos de biopsia.</p>
									</div>
								)}

								{caseType === 'inmunohistoquimica' && (
									<div className="space-y-4">
										{/* Sección de Inmunorreacciones - Solo para Admin */}
										{profile?.role === 'admin' && (
											<div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
												<div className="flex items-center gap-2 mb-3">
													<Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
													<h4 className="font-semibold text-purple-800 dark:text-purple-300">
														Solicitar Inmunorreacciones
													</h4>
												</div>

												<div className="space-y-3">
													<div>
														<label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
															Agregar Inmunorreacciones
														</label>
														<TagInput
															value={inmunorreacciones ?? []}
															onChange={setInmunorreacciones}
															placeholder="Escribir inmunorreacción y presionar Enter..."
															maxTags={20}
															allowDuplicates={false}
															className="bg-white dark:bg-gray-800"
														/>
														<p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
															Ejemplo: RE, RP, CK7, CK20, etc. Presiona Enter después de cada una.
														</p>
													</div>

													{inmunorreacciones.length > 0 && (
														<div className="bg-white dark:bg-gray-800 p-3 rounded border">
															<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
																Resumen de la solicitud:
															</p>
															<div className="grid grid-cols-3 gap-4 text-sm">Información Clínica *
																<div>
																	<span className="text-gray-500 dark:text-gray-400">Cantidad:</span>
																	<p className="font-medium">{inmunorreacciones.length} reacciones</p>
																</div>
																<div>
																	<span className="text-gray-500 dark:text-gray-400">Precio unitario:</span>
																	<p className="font-medium">$18.00</p>
																</div>
																<div>
																	<span className="text-gray-500 dark:text-gray-400">Total:</span>
																	<p className="font-medium text-green-600 dark:text-green-400">
																		${(inmunorreacciones.length * 18).toFixed(2)}
																	</p>
																</div>
															</div>
														</div>
													)}

													<Button
														type="button"
														onClick={handleRequestImmunoreactions}
														disabled={inmunorreacciones.length === 0 || isRequestingImmuno}
														className="w-full bg-purple-600 hover:bg-purple-700 text-white"
													>
														{isRequestingImmuno ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Solicitando...
															</>
														) : (
															<>
																<Heart className="w-4 h-4 mr-2" />
																Solicitar inmunorreacciones ({inmunorreacciones.length})
															</>
														)}
													</Button>
												</div>
											</div>
										)}
									</div>
								)}

								{caseType === 'citologia' && (
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Citología</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">Configuración para casos de citología.</p>
									</div>
								)}

								{/* Action Buttons */}

								{/* Activa el nodo de transformar a PDF */}
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
									<Button type="button" variant="outline" onClick={handleTransformToPDF} className="flex-1">
										Transformar a PDF
									</Button>
								</div>

								{/* Activa el nodo principal de n8n */}
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
									<Button type="button" variant="outline" onClick={onClose} className="flex-1">
										Cancelar
									</Button>
									<Button
										type="button"
										className="flex-1 bg-primary hover:bg-primary/80"
										disabled={isSaving}
										onClick={handleGenerateCase}
									>
										{isSaving ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Generando...
											</>
										) : (
											<>
												<Microscope className="w-4 h-4 mr-2" />
												Generar Caso
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
	)
}

export default RequestCaseModal
