import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeftFromLine, Save } from 'lucide-react'
import { CustomDropdown } from '@shared/components/ui/custom-dropdown'
import { useState } from 'react'
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components/ui/button'
import { useToast } from '@shared/hooks/use-toast'
import { supabase } from '@lib/supabase/config'
import type { ChangeLog } from '@lib/supabase-service'

interface EditPatientInfoModalProps {
	isOpen: boolean
	onClose: () => void
	patient: {
		id_number: string
		full_name: string
		phone: string
		email: string | null
		edad?: string | null
	}
	onSave?: () => void
}

const EditPatientInfoModal = ({ isOpen, onClose, patient, onSave }: EditPatientInfoModalProps) => {
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		full_name: patient.full_name,
		phone: patient.phone,
		email: patient.email || '',
		edad: patient.edad?.split(' ')[0] || '',
		edadUnidad: patient.edad?.includes('MESES') ? 'MESES' : 'AÑOS',
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			// Obtener el usuario actual para el registro de cambios
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('No se pudo obtener el usuario actual')

			// Preparar los cambios para el registro
			const changes = []
			if (formData.full_name !== patient.full_name) {
				changes.push({
					field: 'full_name',
					fieldLabel: 'Nombre Completo',
					oldValue: patient.full_name,
					newValue: formData.full_name,
				})
			}
			if (formData.phone !== patient.phone) {
				changes.push({
					field: 'phone',
					fieldLabel: 'Teléfono',
					oldValue: patient.phone,
					newValue: formData.phone,
				})
			}
			if (formData.email !== patient.email) {
				changes.push({
					field: 'email',
					fieldLabel: 'Email',
					oldValue: patient.email,
					newValue: formData.email || null,
				})
			}
			const newEdad = formData.edad ? `${formData.edad} ${formData.edadUnidad}` : null
			if (newEdad !== patient.edad) {
				changes.push({
					field: 'edad',
					fieldLabel: 'Edad',
					oldValue: patient.edad,
					newValue: newEdad,
				})
			}

			if (changes.length === 0) {
				toast({
					description: 'No se detectaron cambios que guardar.',
				})
				setIsLoading(false)
				return
			}

			// Actualizar todos los registros que tengan esta cédula
			const { error: updateError } = await supabase
				.from('medical_records_clean')
				.update({
					full_name: formData.full_name,
					phone: formData.phone,
					email: formData.email || null,
					edad: formData.edad ? `${formData.edad} ${formData.edadUnidad}` : null,
					updated_at: new Date().toISOString(),
				})
				.eq('id_number', patient.id_number)

			if (updateError) throw updateError

			// Obtener todos los registros afectados para registrar los cambios
			const { data: affectedRecords } = await supabase
				.from('medical_records_clean')
				.select('id')
				.eq('id_number', patient.id_number)

			if (!affectedRecords) throw new Error('No se pudieron obtener los registros afectados')

			// Registrar los cambios en change_logs para cada registro afectado
			for (const record of affectedRecords) {
				for (const change of changes) {
					const changeLog: ChangeLog = {
						medical_record_id: record.id,
						user_id: user.id,
						user_email: user.email || 'unknown@email.com',
						user_display_name: user.user_metadata?.display_name || null,
						field_name: change.field,
						field_label: change.fieldLabel,
						old_value: change.oldValue || null,
						new_value: change.newValue || null,
						changed_at: new Date().toISOString(),
					}

					const { error: logError } = await supabase.from('change_logs').insert(changeLog)

					if (logError) throw logError
				}
			}

			toast({
				description: 'Datos del paciente actualizados exitosamente.',
			})

			if (onSave) onSave()
			onClose()
		} catch (error) {
			console.error('Error al actualizar datos del paciente:', error)
			toast({
				variant: 'destructive',
				description: 'Error al actualizar los datos. Por favor intenta de nuevo.',
			})
		} finally {
			setIsLoading(false)
		}
	}

	if (!isOpen) return null
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

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed inset-0 z-[99999999] flex items-center justify-center p-4"
						onClick={onClose}
					>
						<div
							className="bg-white/80 dark:bg-background/50 backdrop-blur-[10px] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-input"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="sticky top-0 bg-white/80 dark:bg-background/50 backdrop-blur-[10px] border-b border-input p-4 sm:p-6 z-10">
								<div className="flex items-center justify-between">
									<div>
										<div>
											<h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
												Editando Paciente: {patient.full_name}
											</h2>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cédula: {patient.id_number}</p>
									</div>
									<button
										onClick={onClose}
										className="p-1.5 sm:p-2 rounded-lg transition-none flex items-center gap-2 cursor-pointer"
									>
										<ArrowLeftFromLine className="size-4" />
										Volver
									</button>
								</div>
							</div>

							{/* Content */}
							<form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
								{/* Patient Info */}
								<div className="flex-1 overflow-y-auto p-4">
									<div className="space-y-4">
										<div className="bg-white/60 dark:bg-background/30 backdrop-blur-[5px] border border-input rounded-lg p-4 hover:shadow-md transition-shadow">
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div className="space-y-2">
													<label className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</label>
													<Input name="full_name" value={formData.full_name} onChange={handleChange} required />
												</div>

												<div className="space-y-2">
													<label className="text-sm text-gray-500 dark:text-gray-400">Teléfono</label>
													<Input name="phone" value={formData.phone} onChange={handleChange} required />
												</div>

												<div className="space-y-2">
													<label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
													<Input type="email" name="email" value={formData.email} onChange={handleChange} />
												</div>

												<div className="space-y-2">
													<label className="text-sm text-gray-500 dark:text-gray-400">Edad</label>
													<div className="flex gap-2">
														<Input
															type="number"
															name="edad"
															value={formData.edad}
															onChange={handleChange}
															placeholder="Ej: 18"
															className="flex-1"
														/>
														<CustomDropdown
															options={[
																{ value: 'AÑOS', label: 'AÑOS' },
																{ value: 'MESES', label: 'MESES' },
															]}
															value={formData.edadUnidad}
															onChange={(value) => setFormData((prev) => ({ ...prev, edadUnidad: value }))}
															className="w-32"
														/>
													</div>
												</div>

												{/* <div className="space-y-2">
													<label className="text-sm text-gray-500 dark:text-gray-400">Cédula</label>
													<Input value={patient.id_number} disabled className="bg-gray-100 dark:bg-gray-800" />
												</div> */}
											</div>
										</div>
									</div>
								</div>

								{/* Footer con botones */}
								<div className="sticky bottom-0 bg-white/80 dark:bg-background/50 backdrop-blur-[10px] border-t border-input p-4 flex justify-end gap-2">
									<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
										Cancelar
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? (
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
								</div>
							</form>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default EditPatientInfoModal
