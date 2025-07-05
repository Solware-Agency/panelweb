import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import type { MedicalRecord } from '@lib/supabase-service'
import { updateMedicalRecordWithLog, deleteMedicalRecord } from '@lib/supabase-service'
import { Button } from '@shared/components/ui/button'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import EditCaseModal from './EditCaseModal'

interface UnifiedCaseModalProps {
	case_: MedicalRecord | null
	isOpen: boolean
	onClose: () => void
	onSave?: () => void
	onDelete?: () => void
}

const UnifiedCaseModal: React.FC<UnifiedCaseModalProps> = ({ case_, isOpen, onClose, onSave, onDelete }) => {
	const [isDeleting, setIsDeleting] = useState(false)
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
	const { toast } = useToast()
	const { user } = useAuth()
	const { profile } = useUserProfile()

	// Determine if user can delete records (only owners and employees)
	const canDelete = profile?.role === 'owner' || profile?.role === 'employee'

	const handleSave = async (caseId: string, updates: Partial<MedicalRecord>, changes: any[]) => {
		if (!user) return

		try {
			const { error } = await updateMedicalRecordWithLog(
				caseId,
				updates,
				changes,
				user.id,
				user.email || 'unknown@email.com',
			)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso actualizado',
				description: 'Los cambios han sido guardados exitosamente.',
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			if (onSave) onSave()
			onClose()
		} catch (error) {
			console.error('Error updating case:', error)
			toast({
				title: '❌ Error al guardar',
				description: 'Hubo un problema al guardar los cambios. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		}
	}

	const handleDelete = async () => {
		if (!case_ || !user) return

		setIsDeleting(true)
		try {
			const { error } = await deleteMedicalRecord(case_.id!)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso eliminado',
				description: 'El caso ha sido eliminado exitosamente.',
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			if (onDelete) onDelete()
			onClose()
		} catch (error) {
			console.error('Error deleting case:', error)
			toast({
				title: '❌ Error al eliminar',
				description: 'Hubo un problema al eliminar el caso. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsDeleting(false)
			setIsConfirmDeleteOpen(false)
		}
	}

	if (!case_) return null

	return (
		<>
			{/* EditCaseModal handles the actual editing */}
			<EditCaseModal case_={case_} isOpen={isOpen} onClose={onClose} onSave={handleSave} />

			{/* Confirmation Modal for Delete */}
			<AnimatePresence>
				{isConfirmDeleteOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/70 z-300"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 flex items-center justify-center z-300 p-4"
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

			{/* Delete button that appears in EditCaseModal */}
			{canDelete && (
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
	)
}

export default UnifiedCaseModal
