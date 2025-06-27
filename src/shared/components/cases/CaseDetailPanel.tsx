import React from 'react'
import { X, User, Stethoscope, CreditCard, FileText, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { MedicalRecord } from '@lib/supabase-service'

interface CaseDetailPanelProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
}

const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({ case_, isOpen, onClose }) => {
	if (!case_) return null

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completado':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'En Proceso':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			case 'Pendiente':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			case 'Cancelado':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
			default:
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
		}
	}

	const InfoSection = ({
		title,
		icon: Icon,
		children,
	}: {
		title: string
		icon: React.ComponentType<{ className?: string }>
		children: React.ReactNode
	}) => (
		<div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
			<div className="flex items-center gap-2 mb-3">
				<Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
			</div>
			{children}
		</div>
	)

	const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
		<div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
			<span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
			<span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right">{value || 'N/A'}</span>
		</div>
	)

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						viewport={{ margin: '0px' }} 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-[9999999]"
					/>

					{/* Panel */}
					<motion.div
						viewport={{ margin: '0px' }}
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-gray-900 shadow-2xl z-[9999999] overflow-y-auto rounded-lg"
					>
						{/* Header */}
						<div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
										Caso {case_.id?.slice(-6).toUpperCase()}
									</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{case_.full_name}</p>
								</div>
								<button
									onClick={onClose}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
								</button>
							</div>

							{/* Status badges */}
							<div className="flex flex-wrap gap-2 mt-4">
								<span
									className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
										case_.payment_status,
									)}`}
								>
									{case_.payment_status}
								</span>
								<span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
									<CheckCircle className="w-3 h-3" />
									{case_.branch}
								</span>
							</div>
						</div>

						{/* Content */}
						<div className="p-4 sm:p-6 space-y-6">
							{/* Patient Information */}
							<InfoSection title="Información del Paciente" icon={User}>
								<div className="space-y-1">
									<InfoRow label="Nombre completo" value={case_.full_name} />
									<InfoRow label="Cédula" value={case_.id_number} />
									<InfoRow label="Edad" value={`${case_.age} años`} />
									<InfoRow label="Teléfono" value={case_.phone} />
									<InfoRow label="Email" value={case_.email || 'N/A'} />
									<InfoRow label="Relación" value={case_.relationship || 'N/A'} />
								</div>
							</InfoSection>

							{/* Medical Information */}
							<InfoSection title="Información Médica" icon={Stethoscope}>
								<div className="space-y-1">
									<InfoRow label="Estudio" value={case_.exam_type} />
									<InfoRow label="Médico tratante" value={case_.treating_doctor} />
									<InfoRow label="Procedencia" value={case_.origin} />
									<InfoRow label="Sede" value={case_.branch} />
									<InfoRow label="Muestra" value={case_.sample_type} />
									<InfoRow label="Cantidad de muestras" value={case_.number_of_samples} />
									<InfoRow
										label="Fecha de ingreso"
										value={new Date(case_.created_at || '').toLocaleDateString('es-ES')}
									/>
								</div>
							</InfoSection>

							{/* Financial Information */}
							<InfoSection title="Información Financiera" icon={CreditCard}>
								<div className="space-y-1">
									<InfoRow label="Monto total" value={`$${case_.total_amount.toLocaleString()}`} />
									<InfoRow label="Monto faltante" value={`$${case_.remaining.toLocaleString()}`} />
									<InfoRow label="Tasa de cambio" value={case_.exchange_rate?.toFixed(2)} />
								</div>

								{/* Payment Methods */}
								<div className="mt-4">
									<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formas de Pago:</h4>
									<div className="space-y-2">
										{case_.payment_method_1 && (
											<div className="bg-white dark:bg-gray-800 p-3 rounded border">
												<div className="flex justify-between items-center">
													<span className="text-sm font-medium">{case_.payment_method_1}</span>
													<span className="text-sm">${case_.payment_amount_1?.toLocaleString()}</span>
												</div>
												{case_.payment_reference_1 && (
													<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_1}
													</div>
												)}
											</div>
										)}

										{case_.payment_method_2 && (
											<div className="bg-white dark:bg-gray-800 p-3 rounded border">
												<div className="flex justify-between items-center">
													<span className="text-sm font-medium">{case_.payment_method_2}</span>
													<span className="text-sm">${case_.payment_amount_2?.toLocaleString()}</span>
												</div>
												{case_.payment_reference_2 && (
													<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_2}
													</div>
												)}
											</div>
										)}

										{case_.payment_method_3 && (
											<div className="bg-white dark:bg-gray-800 p-3 rounded border">
												<div className="flex justify-between items-center">
													<span className="text-sm font-medium">{case_.payment_method_3}</span>
													<span className="text-sm">${case_.payment_amount_3?.toLocaleString()}</span>
												</div>
												{case_.payment_reference_3 && (
													<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_3}
													</div>
												)}
											</div>
										)}

										{case_.payment_method_4 && (
											<div className="bg-white dark:bg-gray-800 p-3 rounded border">
												<div className="flex justify-between items-center">
													<span className="text-sm font-medium">{case_.payment_method_4}</span>
													<span className="text-sm">${case_.payment_amount_4?.toLocaleString()}</span>
												</div>
												{case_.payment_reference_4 && (
													<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														Ref: {case_.payment_reference_4}
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
										value={new Date(case_.created_at || '').toLocaleDateString('es-ES')}
									/>
									<InfoRow
										label="Última actualización"
										value={new Date(case_.updated_at || '').toLocaleDateString('es-ES')}
									/>
									{case_.comments && (
										<div className="py-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios:</span>
											<p className="text-sm text-gray-900 dark:text-gray-100 mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
												{case_.comments}
											</p>
										</div>
									)}
								</div>
							</InfoSection>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default CaseDetailPanel