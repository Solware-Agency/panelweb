import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@shared/components/ui/button'
import { supabase } from '@lib/supabase/config'
import {
	X,
	User,
	// FileText,
	CheckCircle,
	ArrowRight,
	Sparkles,
	Heart,
	// Mail,
	// Phone,
	Stethoscope,
	Microscope,
} from 'lucide-react'
import { useToast } from '@shared/hooks/use-toast'
interface MedicalRecord {
	id?: string
	full_name?: string
	id_number?: string
	email?: string | null
	phone?: string | null
	address?: string | null
	birth_date?: string | null
	exam_type?: string | null
	informacion_clinica?: string | null
	googledocs_url?: string | null
}

interface StepsCaseModalProps {
	case_: MedicalRecord
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

const steps = [
	{
		id: 'patient',
		title: 'Datos',
		icon: User,
		description: 'Rellenar el Doc',
	},
	{
		id: 'clinical',
		title: 'Generar',
		icon: Stethoscope,
		description: 'Preparar el caso',
	},
	{
		id: 'review',
		title: 'Finalizar',
		icon: CheckCircle,
		description: 'Descargar el PDF',
	},
]

const StepsCaseModal: React.FC<StepsCaseModalProps> = ({ case_, isOpen, onClose, onSuccess }) => {
	const [activeStep, setActiveStep] = useState(0)
	const [isCompleting, setIsCompleting] = useState(false)
	const [, setIsSaving] = useState(false)
	const { toast } = useToast()

	const handleNext = () => {
		if (activeStep < steps.length - 1) {
			setActiveStep((prev) => prev + 1)
		} else {
			handleFinish()
		}
	}

	const handleFinish = async () => {
		setIsCompleting(true)

		// Simular proceso de completado
		await new Promise((resolve) => setTimeout(resolve, 2000))

		onSuccess()
		setActiveStep(0)
		setIsCompleting(false)
		onClose()
	}

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

	// const handleGenerateCase = async () => {
	// 	if (!case_?.id) {
	// 		toast({
	// 			title: '❌ Error',
	// 			description: 'No se encontró el ID del caso.',
	// 			variant: 'destructive',
	// 		})
	// 		return
	// 	}

	// 	try {
	// 		setIsSaving(true)

	// 		console.log('Sending request to n8n webhook with case ID:', case_.id)

	// 		const requestBody = {
	// 			caseId: case_.id,
	// 		}

	// 		console.log('Request body:', requestBody)

	// 		const response = await fetch(
	// 			'https://solwareagencia.app.n8n.cloud/webhook-test/36596a3a-0aeb-4ee1-887f-854324cc785b',
	// 			{
	// 				method: 'POST',
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 					Accept: 'application/json',
	// 				},
	// 				body: JSON.stringify(requestBody),
	// 			},
	// 		)

	// 		console.log('Response status:', response.status)

	// 		if (!response.ok) {
	// 			let errorMessage = `HTTP ${response.status}: ${response.statusText}`

	// 			try {
	// 				const errorData = await response.text()
	// 				console.log('Error response body:', errorData)
	// 				errorMessage += ` - ${errorData}`
	// 			} catch (e) {
	// 				console.log('Could not read error response body', e)
	// 			}

	// 			throw new Error(errorMessage)
	// 		}

	// 		// Try to parse the response
	// 		let responseData
	// 		try {
	// 			responseData = await response.json()
	// 			console.log('Success response:', responseData)
	// 		} catch (e) {
	// 			responseData = await response.text()
	// 			console.log('Success response (text):', responseData, e)
	// 		}

	// 		toast({
	// 			title: '✅ Flujo activado',
	// 			description: 'El flujo de n8n ha sido activado exitosamente.',
	// 			className: 'bg-green-100 border-green-400 text-green-800',
	// 		})
	// 	} catch (error) {
	// 		console.error('Error in handleGenerateCase:', error)

	// 		let errorMessage = 'Hubo un problema al activar el flujo.'

	// 		if (error instanceof TypeError && error.message === 'Failed to fetch') {
	// 			errorMessage =
	// 				'No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.'
	// 		} else if (error instanceof Error && error.message.includes('CORS')) {
	// 			errorMessage = 'Error de configuración del servidor (CORS). Contacta al administrador.'
	// 		} else if (error instanceof Error && error.message.includes('HTTP')) {
	// 			errorMessage = `Error del servidor: ${error.message}`
	// 		}

	// 		toast({
	// 			title: '❌ Error al activar flujo',
	// 			description: errorMessage,
	// 			variant: 'destructive',
	// 		})
	// 	} finally {
	// 		setIsSaving(false)
	// 	}
	// }

	const handleGenerateCaseAndOpenDoc = async () => {
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
  
      // 1. Verificar si ya existe el enlace
      const { data: initialData, error: initialError } = await supabase
        .from('medical_records_clean')
        .select('googledocs_url')
        .eq('id', case_.id)
        .single<MedicalRecord>()
  
      if (initialError) {
        console.error('Error inicial consultando googledocs_url:', initialError)
        toast({
          title: '❌ Error',
          description: 'No se pudo obtener el estado del documento.',
          variant: 'destructive',
        })
        return
      }
  
      if (initialData?.googledocs_url) {
        window.open(initialData.googledocs_url, '_blank')
        return
      }
  
      // 2. No existe, así que activa n8n
      await fetch('https://solwareagencia.app.n8n.cloud/webhook/7c840100-fd50-4598-9c48-c7ce60f82506', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ caseId: case_.id }),
      })
  
      // 3. Polling: reintenta hasta que Supabase tenga el link (máx 5 intentos cada 2s)
      const maxAttempts = 5
      const delay = 2000 // 2 segundos
      let attempts = 0
      let foundURL = null
  
      while (attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, delay))
        const { data: retryData } = await supabase
          .from('medical_records_clean')
          .select('googledocs_url')
          .eq('id', case_.id)
          .single<MedicalRecord>()
  
        if (retryData?.googledocs_url) {
          foundURL = retryData.googledocs_url
          break
        }
  
        attempts++
      }
  
      if (foundURL) {
        window.open(foundURL, '_blank')
      } else {
        toast({
          title: '⚠️ Documento no disponible',
          description: 'El documento aún no está listo. Intenta nuevamente en unos segundos.',
          variant: 'default',
        })
      }
    } catch (err) {
      console.error('Error en handleGenerateCaseAndOpenDoc:', err)
      toast({
        title: '❌ Error inesperado',
        description: 'Ocurrió un problema al abrir el documento.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }
  

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="space-y-4"
					>
						<div className="grid gap-4">
							{/* Activa el nodo principal de n8n */}
							<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
									<Button
										type="button"
										className="flex-1 bg-primary hover:bg-primary/80"
										onClick={handleGenerateCaseAndOpenDoc}
									>
										<Microscope className="w-4 h-4 mr-2" />
										Rellenar los Datos
									</Button>
								</div>
							</div>
							<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
								<p className="text-teal-400 text-sm">
									Para completar este paso, haz clic en el botón de arriba para ir a rellenar los datos del documento en
									Google Docs. Una vez que termines regresa a esta pestaña para continuar con el siguiente paso.
								</p>
							</div>
						</div>
					</motion.div>
				)

			case 1:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="space-y-4"
					>
						<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
							{/* Activa el nodo de transformar a PDF */}
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<Button type="button" variant="outline" onClick={handleTransformToPDF} className="flex-1">
									Transformar a PDF
								</Button>
							</div>
						</div>
						<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
							<p className="text-teal-400 text-sm">
								Dale clic al botón que tienes arriba y espera unos segundos mientras preparamos tu documento. Ten
								paciencia, este proceso puede tardar un poco dependiendo de la carga del sistema. No cierres esta
								pestaña hasta que el documento esté listo.
							</p>
						</div>
					</motion.div>
				)

			case 2:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="space-y-4"
					>
						<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
							{/* Activa el nodo de transformar a PDF */}
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<Button type="button" variant="outline" className="flex-1">
									Descargar PDF
								</Button>
							</div>
						</div>
						<div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
							<p className="text-teal-400 text-sm">
								¡Listo! Ya completaste todos los pasos. Ten en cuenta que si necesitas hacer cambios en el documento,
								deberás repetir este mismo proceso desde el inicio. Si no necesitas modificar nada, puedes descargar el
								PDF directamente sin volver a entrar a esta pestaña.
							</p>
						</div>
					</motion.div>
				)

			default:
				return null
		}
	}

	if (!isOpen) return null

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				{/* Backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				/>

				{/* Modal */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
				>
					{/* Header */}
					<div className="bg-pink-500 px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Sparkles className="w-6 h-6 text-white flex-shrink-0" />
								<div className="min-w-0">
									<h2 className="text-lg font-bold text-white">Generar Caso Médico</h2>
									<p className="text-sm text-indigo-100 truncate">{case_ ? `Para ${case_.full_name}` : 'Nuevo caso'}</p>
								</div>
							</div>
							<button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
								<X className="w-5 h-5 text-white" />
							</button>
						</div>
					</div>

					{/* Steps Indicator */}
					<div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
						<div className="flex items-center justify-between">
							{steps.map((step, index) => {
								const Icon = step.icon
								const isActive = index === activeStep
								const isCompleted = index < activeStep

								return (
									<div key={step.id} className="flex items-center justify-center flex-1 last-of-type:flex-none">
										<div className="flex flex-col items-center">
											<motion.div
												className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
													isCompleted
														? 'border-green-500 text-white'
														: isActive
														? 'border-pink-500 text-white'
														: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
												}`}
												whileHover={{ scale: 1.05 }}
											>
												<Icon className="w-4 h-4" />
											</motion.div>
											<div className="mt-2 text-center">
												<p
													className={`text-xs font-medium ${
														isActive ? 'text-pink-400' : 'text-gray-600 dark:text-gray-400'
													}`}
												>
													{step.title}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">{step.description}</p>
											</div>
										</div>
										{index < steps.length - 1 && (
											<div
												className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
													index < activeStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
												}`}
											/>
										)}
									</div>
								)
							})}
						</div>
					</div>

					{/* Content */}
					<div className="px-6 py-6 flex flex-col">
						<AnimatePresence mode="wait">
							<div className="flex-1">{renderStepContent()}</div>
						</AnimatePresence>
					</div>

					{/* Footer */}
					<div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
						<div className="flex items-center justify-end gap-3">
							<div className="flex items-center gap-2">
								<button
									onClick={onClose}
									className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
								>
									Cancelar
								</button>

								<motion.button
									onClick={handleNext}
									disabled={isCompleting}
									className="flex items-center gap-2 px-6 py-2 bg-transparent border border-pink-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									{isCompleting ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span className="hidden sm:inline">Saliendo...</span>
										</>
									) : activeStep === steps.length - 1 ? (
										<>
											<Heart className="w-4 h-4" />
											<span className="hidden sm:inline">Terminar Proceso</span>
										</>
									) : (
										<>
											<span className="hidden sm:inline">Siguiente</span>
											<ArrowRight className="w-4 h-4" />
										</>
									)}
								</motion.button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	)
}

export default StepsCaseModal
