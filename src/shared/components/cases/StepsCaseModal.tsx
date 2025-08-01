import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@shared/components/ui/button'
import { supabase } from '@lib/supabase/config'
import {
	X,
	User,
	ArrowLeft,
	ArrowRight,
	Sparkles,
	Heart,
	Stethoscope,
	Microscope,
} from 'lucide-react'
import { useToast } from '@shared/hooks/use-toast'
import { useBodyScrollLock } from '@shared/hooks/useBodyScrollLock'

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
	informepdf_url?: string | null
	code?: string | null
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
		description: 'Generar Documento',
	},
	{
		id: 'clinical',
		title: 'Generar',
		icon: Stethoscope,
		description: 'Exportar Documento',
	},
]

const StepsCaseModal: React.FC<StepsCaseModalProps> = ({ case_, isOpen, onClose, onSuccess }) => {
	const [activeStep, setActiveStep] = useState(0)
	const [isCompleting, setIsCompleting] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const { toast } = useToast()
	useBodyScrollLock(isOpen)
	const handleNext = () => {
		if (activeStep < steps.length - 1) {
			setActiveStep((prev) => prev + 1)
		} else {
			handleFinish()
		}
	}

	const handleBack = () => {
		if (activeStep > 0) {
			setActiveStep((prev) => prev - 1)
		}
	}

	const handleFinish = async () => {
		setIsCompleting(true)

		onSuccess()
		setActiveStep(0)
		setIsCompleting(false)
		onClose()
	}

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

			console.log('[1] Verificando si ya existe googledocs_url para el caso', case_.id)
			const { data: initialData, error: initialError } = await supabase
				.from('medical_records_clean')
				.select('googledocs_url')
				.eq('id', case_.id)
				.single<MedicalRecord>()

			if (initialError) {
				console.error('Error al obtener URL del Documento:', initialError)
				toast({
					title: '❌ Error',
					description: 'No se pudo obtener el estado del documento.',
					variant: 'destructive',
				})
				return
			}

			if (initialData?.googledocs_url) {
				console.log('[1] Documento ya existe, abriendo:', initialData.googledocs_url)
				window.open(initialData.googledocs_url, '_blank')
				// Ejecutar handleNext automáticamente después de abrir el documento
				setTimeout(() => {
					handleNext()
				}, 1000) // Pequeño delay para asegurar que el documento se abra
				return
			}

			console.log('[2] No existe googledocs_url, enviando POST a n8n...')
			const webhookRes = await fetch(
				'https://solwareagencia.app.n8n.cloud/webhook/7c840100-fd50-4598-9c48-c7ce60f82506',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify({ caseId: case_.id }),
				},
			)

			console.log('[2] Webhook enviado. Status:', webhookRes.status)

			if (!webhookRes.ok) {
				const errorText = await webhookRes.text()
				throw new Error(`Error en webhook: ${webhookRes.status} - ${errorText}`)
			}

			// Polling para esperar el link de Google Docs
			console.log('[3] Iniciando polling para esperar el enlace generado...')
			const maxAttempts = 10
			const delay = 2000
			let attempts = 0
			let foundURL = null

			while (attempts < maxAttempts) {
				console.log(`[3] Intento ${attempts + 1}/${maxAttempts}...`)
				await new Promise((res) => setTimeout(res, delay))

				const { data: retryData, error: retryError } = await supabase
					.from('medical_records_clean')
					.select('googledocs_url')
					.eq('id', case_.id)
					.single<MedicalRecord>()

				if (retryError) {
					console.warn(`[3] Error en intento ${attempts + 1}:`, retryError)
				}

				if (retryData?.googledocs_url) {
					console.log('[3] Documento listo, abriendo:', retryData.googledocs_url)
					foundURL = retryData.googledocs_url
					break
				}

				attempts++
			}

			try {
				window.open(foundURL as string, '_blank')
				// Ejecutar handleNext automáticamente después de abrir el documento
				setTimeout(() => {
					handleNext()
				}, 1000) // Pequeño delay para asegurar que el documento se abra
			} catch (err) {
				console.error('Error al abrir el Documento:', err)
				toast({
					title: '❌ Error',
					description: 'No se pudo acceder al Documento. Intenta nuevamente.',
					variant: 'destructive',
				})
			}
		} catch (err) {
			console.error('[ERROR] handleGenerateCaseAndOpenDoc:', err)
			toast({
				title: '❌ Error inesperado',
				description: 'Ocurrió un problema al abrir el documento.',
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleTransformToPDF = async () => {
		if (!case_?.id) {
			toast({
				title: '❌ Error',
				description: 'No se encontró el ID del caso.',
				variant: 'destructive',
			});
			return;
		}
	
		try {
			setIsSaving(true);
	
			// 1. Activar el flujo de n8n (tu lógica existente)
			console.log('Enviando solicitud a webhook n8n con case ID:', case_.id);
			
			const response = await fetch(
				'https://solwareagencia.app.n8n.cloud/webhook/36596a3a-0aeb-4ee1-887f-854324cc785b',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
					body: JSON.stringify({ caseId: case_.id }),
				}
			);
	
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
			}
	
			// 2. Esperar y verificar la generación del PDF (lógica existente mejorada)
			let pdfUrl: string | null = null;
			let attempts = 0;
			const maxAttempts = 10;
	
			while (attempts < maxAttempts && !pdfUrl) {
				const { data, error } = await supabase
					.from('medical_records_clean')
					.select('informepdf_url')
					.eq('id', case_.id)
					.single();
	
				if (error) {
					console.error('Error obteniendo URL del PDF:', error);
					await new Promise(resolve => setTimeout(resolve, 2000));
					attempts++;
					continue;
				}
	
				if (data?.informepdf_url) {
					pdfUrl = data.informepdf_url;
					break;
				}
	
				await new Promise(resolve => setTimeout(resolve, 2000));
				attempts++;
			}
	
			if (!pdfUrl) {
				toast({
					title: '⏳ Documento no disponible aún',
					description: 'El PDF aún no está listo. Intenta nuevamente en unos segundos.',
					variant: 'destructive',
				});
				return;
			}
	
			// 3. Descarga segura mediante el proxy (nueva implementación)
			const pdfFilename = pdfUrl.split('/').pop()?.split('?')[0] || '';
			const { data: { session } } = await supabase.auth.getSession();
	
			if (!session) {
				throw new Error('No hay sesión activa');
			}
	
			const proxyResponse = await fetch(`/api/get-pdf?filename=${encodeURIComponent(pdfFilename)}`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`
				}
			});
	
			if (!proxyResponse.ok) {
				const errorData = await proxyResponse.json();
				throw new Error(errorData.error || 'Error al obtener el PDF');
			}
	
			// Manejar la descarga del blob
			const blob = await proxyResponse.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = pdfFilename;
			a.click();
			window.URL.revokeObjectURL(url);
	
			// 4. Continuar con el flujo
			setTimeout(handleNext, 1000);
	
		} catch (error) {
			console.error('Error en handleTransformToPDF:', error);
			
			let errorMessage = 'Hubo un problema al generar el PDF.';
			if (error instanceof Error) {
				if (error.message.includes('Failed to fetch')) {
					errorMessage = 'Error de conexión. Verifica tu internet.';
				} else if (error.message.includes('HTTP')) {
					errorMessage = `Error del servidor: ${error.message}`;
				} else {
					errorMessage = error.message;
				}
			}
	
			toast({
				title: '❌ Error',
				description: errorMessage,
				variant: 'destructive',
			});
	
		} finally {
			setIsSaving(false);
		}
	};

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
										disabled={isSaving}
									>
										{isSaving ? (
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										) : (
											<Microscope className="w-4 h-4 mr-2" />
										)}
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
							{/* Activa el nodo de transformar a PDF y luego te redirecciona al PDF */}
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={handleTransformToPDF}
									className="flex-1"
									disabled={isSaving}
								>
									{isSaving ? (
										<>
											<div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
											Generando PDF...
										</>
									) : (
										'Descargar PDF'
									)}
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

			default:
				return null
		}
	}

	const handleClose = () => {
		setActiveStep(0)
		onClose()
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
					onClick={handleClose}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				/>

				{/* Modal */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
				>
					{/* Header */}
					<div className="bg-pink-500 px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Sparkles className="w-6 h-6 text-white flex-shrink-0" />
								<div className="min-w-0">
									<div>
						<h2 className="text-lg font-bold text-white">Generar Caso Médico - {case_?.code}</h2>
						<div className="w-16 sm:w-24 h-1 bg-white mt-2 rounded-full" />
					</div>
									<p className="text-sm text-indigo-100 truncate">{case_ ? `Para ${case_.full_name}` : 'Nuevo caso'}</p>
								</div>
							</div>
							<button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-none flex-shrink-0">
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
												className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform duration-300 ${
													isCompleted
														? 'border-green-500 text-gray-800 dark:text-white'
														: isActive
														? 'border-pink-500 text-gray-800 dark:text-white'
														: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
												}`}
												whileHover={{ scale: 1.05 }}
											>
												<Icon className="w-4 h-4 text-gray-800 dark:text-white" />
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
												className={`flex-1 h-0.5 mx-2 transition-none duration-300 ${
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
							<div className="flex items-center gap-5">
								<motion.button
									onClick={handleBack}
									disabled={isSaving}
									className={`flex items-center gap-2 px-6 py-2 bg-transparent border border-pink-500 text-gray-800 dark:text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
										activeStep === 0 ? 'hidden' : ''
									}`}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<ArrowLeft className="w-4 h-4" />
									Anterior
								</motion.button>

								<motion.button
									onClick={handleNext}
									disabled={isCompleting || isSaving}
									className="flex items-center gap-2 px-6 py-2 bg-transparent border border-pink-500 text-gray-800 dark:text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									{isCompleting ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span className="hidden sm:inline">Saliendo...</span>
										</>
									) : isSaving ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span className="hidden sm:inline">Cargando...</span>
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
