import React, { useState } from 'react'
import { X, Save, AlertCircle, Crown, Briefcase, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useToast } from '@shared/hooks/use-toast'

interface UserProfile {
	id: string
	email: string
	role: 'owner' | 'employee'
	created_at: string
	updated_at: string
}

interface EditUserModalProps {
	user: UserProfile | null
	isOpen: boolean
	onClose: () => void
	onSave: (userId: string, newRole: 'owner' | 'employee') => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
	const [selectedRole, setSelectedRole] = useState<'owner' | 'employee'>('employee')
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const { toast } = useToast()

	// Reset selected role when user changes
	React.useEffect(() => {
		if (user) {
			setSelectedRole(user.role)
		}
	}, [user])

	const handleRoleChange = () => {
		if (!user || selectedRole === user.role) {
			toast({
				title: 'Sin cambios',
				description: 'No se detectaron cambios en el rol del usuario.',
				variant: 'default',
			})
			return
		}

		setIsConfirmOpen(true)
	}

	const handleConfirmSave = async () => {
		if (!user) return

		setIsSaving(true)
		try {
			await onSave(user.id, selectedRole)

			toast({
				title: '✅ Rol actualizado',
				description: `El rol de ${user.email} ha sido cambiado a ${selectedRole === 'owner' ? 'Propietario' : 'Empleado'}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			setIsConfirmOpen(false)
			onClose()
		} catch (error) {
			console.error('Error updating user role:', error)
			toast({
				title: '❌ Error al actualizar',
				description: 'Hubo un problema al cambiar el rol del usuario. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const getRoleIcon = (role: string) => {
		switch (role) {
			case 'owner':
				return <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
			case 'employee':
				return <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
			default:
				return <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
		}
	}

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'owner':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			case 'employee':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
		}
	}

	if (!user) return null

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
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed inset-0 flex items-center justify-center z-[999999] p-4"
					>
						<div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full">
							{/* Header */}
							<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
								<div>
									<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Editar Usuario</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
								</div>
								<button
									onClick={onClose}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
								</button>
							</div>

							{/* Content */}
							<div className="p-6">
								{/* Current Role Display */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Rol Actual
									</label>
									<div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getRoleColor(user.role)}`}>
										{getRoleIcon(user.role)}
										<span className="font-medium">
											{user.role === 'owner' ? 'Propietario' : 'Empleado'}
										</span>
									</div>
								</div>

								{/* Role Selector */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Nuevo Rol
									</label>
									<Select value={selectedRole} onValueChange={(value: 'owner' | 'employee') => setSelectedRole(value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Seleccionar rol" />
										</SelectTrigger>
										<SelectContent className="z-[9999999]">
											<SelectItem value="owner">
												<div className="flex items-center gap-2">
													<Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
													<span>Propietario</span>
												</div>
											</SelectItem>
											<SelectItem value="employee">
												<div className="flex items-center gap-2">
													<Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
													<span>Empleado</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Role Descriptions */}
								<div className="mb-6 space-y-3">
									<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
										<div className="flex items-center gap-2 mb-1">
											<Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
											<span className="font-medium text-yellow-800 dark:text-yellow-300">Propietario</span>
										</div>
										<p className="text-xs text-yellow-700 dark:text-yellow-400">
											Acceso completo al dashboard, estadísticas, reportes y gestión de usuarios.
										</p>
									</div>

									<div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
										<div className="flex items-center gap-2 mb-1">
											<Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
											<span className="font-medium text-blue-800 dark:text-blue-300">Empleado</span>
										</div>
										<p className="text-xs text-blue-700 dark:text-blue-400">
											Acceso al formulario de registro de casos médicos y visualización de registros.
										</p>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3">
									<Button variant="outline" onClick={onClose} className="flex-1">
										Cancelar
									</Button>
									<Button onClick={handleRoleChange} className="flex-1 bg-primary hover:bg-primary/80">
										<Save className="w-4 h-4 mr-2" />
										Guardar Cambios
									</Button>
								</div>
							</div>
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
									<div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-md w-full">
										<div className="p-6">
											<div className="flex items-center gap-3 mb-4">
												<div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
													<AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
												</div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Cambio de Rol</h3>
											</div>

											<p className="text-gray-600 dark:text-gray-400 mb-4">
												¿Estás seguro de que quieres cambiar el rol de <strong>{user.email}</strong> de{' '}
												<span className="font-medium">
													{user.role === 'owner' ? 'Propietario' : 'Empleado'}
												</span>{' '}
												a{' '}
												<span className="font-medium">
													{selectedRole === 'owner' ? 'Propietario' : 'Empleado'}
												</span>?
											</p>

											<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
												<p className="text-sm text-yellow-800 dark:text-yellow-300">
													<strong>Importante:</strong> Este cambio afectará inmediatamente los permisos de acceso del usuario.
												</p>
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
													className="flex-1 bg-orange-600 hover:bg-orange-700"
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

export default EditUserModal