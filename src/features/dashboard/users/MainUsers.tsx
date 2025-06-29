import React, { useState } from 'react'
import { Users, Mail, Calendar, Shield, Search, Filter, UserCheck, UserX, Crown, Briefcase, Edit } from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Button } from '@shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { updateUserRole, canManageUsers } from '@lib/supabase/user-management'
import { useAuth } from '@app/providers/AuthContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import EditUserModal from '@shared/components/users/EditUserModal'
import { useToast } from '@shared/hooks/use-toast'

interface UserProfile {
	id: string
	email: string
	role: 'owner' | 'employee'
	created_at: string
	updated_at: string
	email_confirmed_at?: string
	last_sign_in_at?: string
}

const MainUsers: React.FC = () => {
	const { user: currentUser } = useAuth()
	const { toast } = useToast()
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('all')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)

	// Query para obtener usuarios
	const { data: users, isLoading, error, refetch } = useQuery({
		queryKey: ['users'],
		queryFn: async (): Promise<UserProfile[]> => {
			try {
				// Obtener perfiles de usuarios
				const { data: profiles, error: profilesError } = await supabase
					.from('profiles')
					.select('*')
					.order('created_at', { ascending: false })

				if (profilesError) throw profilesError

				// Obtener información adicional de auth.users si es posible
				// Nota: En producción, esto requeriría permisos especiales o una función de edge
				const usersWithAuthInfo = profiles?.map(profile => ({
					...profile,
					email_confirmed_at: null, // Placeholder - requiere permisos admin
					last_sign_in_at: null, // Placeholder - requiere permisos admin
				})) || []

				return usersWithAuthInfo
			} catch (error) {
				console.error('Error fetching users:', error)
				throw error
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutos
	})

	// Query para verificar permisos del usuario actual
	const { data: canManage } = useQuery({
		queryKey: ['can-manage-users', currentUser?.id],
		queryFn: async () => {
			if (!currentUser?.id) return false
			return await canManageUsers(currentUser.id)
		},
		enabled: !!currentUser?.id,
	})

	const getRoleIcon = (role: string) => {
		switch (role) {
			case 'owner':
				return <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
			case 'employee':
				return <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
			default:
				return <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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

	const getStatusIcon = (user: UserProfile) => {
		if (user.email_confirmed_at) {
			return <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
		}
		return <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
	}

	const getStatusColor = (user: UserProfile) => {
		if (user.email_confirmed_at) {
			return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
		}
		return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
	}

	const handleEditUser = (user: UserProfile) => {
		// Verificar permisos antes de permitir edición
		if (!canManage) {
			toast({
				title: '❌ Sin permisos',
				description: 'No tienes permisos para editar usuarios.',
				variant: 'destructive',
			})
			return
		}

		// No permitir que un usuario se edite a sí mismo
		if (user.id === currentUser?.id) {
			toast({
				title: '❌ Acción no permitida',
				description: 'No puedes cambiar tu propio rol.',
				variant: 'destructive',
			})
			return
		}

		setEditingUser(user)
		setIsEditModalOpen(true)
	}

	const handleSaveUser = async (userId: string, newRole: 'owner' | 'employee') => {
		try {
			const { error } = await updateUserRole(userId, newRole)
			
			if (error) {
				throw error
			}

			// Refrescar la lista de usuarios
			refetch()
		} catch (error) {
			console.error('Error updating user role:', error)
			throw error
		}
	}

	// Filtrar usuarios
	const filteredUsers = users?.filter(user => {
		const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesRole = roleFilter === 'all' || user.role === roleFilter
		const matchesStatus = statusFilter === 'all' || 
			(statusFilter === 'verified' && user.email_confirmed_at) ||
			(statusFilter === 'unverified' && !user.email_confirmed_at)
		
		return matchesSearch && matchesRole && matchesStatus
	}) || []

	// Estadísticas
	const stats = {
		total: users?.length || 0,
		owners: users?.filter(u => u.role === 'owner').length || 0,
		employees: users?.filter(u => u.role === 'employee').length || 0,
		verified: users?.filter(u => u.email_confirmed_at).length || 0,
	}

	if (isLoading) {
		return (
			<div className="p-3 sm:p-6">
				<div className="flex items-center justify-center py-12">
					<div className="flex items-center gap-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
						<span className="text-lg text-gray-700 dark:text-gray-300">Cargando usuarios...</span>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-3 sm:p-6">
				<div className="text-center py-12">
					<div className="text-red-500 dark:text-red-400">
						<p className="text-lg font-medium">Error al cargar los usuarios</p>
						<p className="text-sm mt-2">Verifica tu conexión a internet o contacta al administrador</p>
						<button
							onClick={() => refetch()}
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							Reintentar
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 sm:p-6">
			{/* Estadísticas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
								<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{stats.total}
							</p>
						</div>
					</div>
				</Card>

				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
								<Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Propietarios</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{stats.owners}
							</p>
						</div>
					</div>
				</Card>

				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
								<Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Empleados</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{stats.employees}
							</p>
						</div>
					</div>
				</Card>

				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Verificados</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{stats.verified}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Filtros y búsqueda */}
			<Card className="hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg mb-6">
				<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Búsqueda */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								type="text"
								placeholder="Buscar por email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Filtro por rol */}
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-gray-400" />
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filtrar por rol" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los roles</SelectItem>
									<SelectItem value="owner">Propietarios</SelectItem>
									<SelectItem value="employee">Empleados</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Filtro por estado */}
						<div className="flex items-center gap-2">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filtrar por estado" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos los estados</SelectItem>
									<SelectItem value="verified">Verificados</SelectItem>
									<SelectItem value="unverified">No verificados</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Contador de resultados */}
					<div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
						Mostrando {filteredUsers.length} de {stats.total} usuarios
					</div>
				</div>
			</Card>

			{/* Tabla de usuarios */}
			<Card className="hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
				<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300">
					{/* Vista móvil - Cards */}
					<div className="block lg:hidden p-4">
						<div className="space-y-4">
							{filteredUsers.map((user) => (
								<div key={user.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
									{/* Header con rol y estado */}
									<div className="flex items-center justify-between mb-3">
										<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
											{getRoleIcon(user.role)}
											{user.role === 'owner' ? 'Propietario' : 'Empleado'}
										</span>
										<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
											{getStatusIcon(user)}
											{user.email_confirmed_at ? 'Verificado' : 'No verificado'}
										</span>
									</div>

									{/* Email */}
									<div className="flex items-center gap-2 mb-2">
										<Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.email}</p>
									</div>

									{/* Fecha de registro */}
									<div className="flex items-center gap-2 mb-3">
										<Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Registrado: {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
										</p>
									</div>

									{/* Botón de editar */}
									{canManage && user.id !== currentUser?.id && (
										<Button
											onClick={() => handleEditUser(user)}
											size="sm"
											variant="outline"
											className="w-full"
										>
											<Edit className="w-3 h-3 mr-2" />
											Editar Rol
										</Button>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Vista desktop - Tabla */}
					<div className="hidden lg:block overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px]">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Usuario
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Rol
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Estado
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Fecha de Registro
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Última Actualización
									</th>
									{canManage && (
										<th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Acciones
										</th>
									)}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredUsers.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
													<Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
												</div>
												<div>
													<p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id.slice(-8)}</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
												{getRoleIcon(user.role)}
												{user.role === 'owner' ? 'Propietario' : 'Empleado'}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
												{getStatusIcon(user)}
												{user.email_confirmed_at ? 'Verificado' : 'No verificado'}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
											{format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
											{format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
										</td>
										{canManage && (
											<td className="px-6 py-4 text-center">
												{user.id !== currentUser?.id ? (
													<Button
														onClick={() => handleEditUser(user)}
														size="sm"
														variant="outline"
													>
														<Edit className="w-3 h-3 mr-2" />
														Editar
													</Button>
												) : (
													<span className="text-xs text-gray-500 dark:text-gray-400">
														(Tú mismo)
													</span>
												)}
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Estado vacío */}
					{filteredUsers.length === 0 && (
						<div className="text-center py-12">
							<div className="text-gray-500 dark:text-gray-400">
								<Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium">No se encontraron usuarios</p>
								<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
							</div>
						</div>
					)}
				</div>
			</Card>

			{/* Modal de edición */}
			<EditUserModal
				user={editingUser}
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false)
					setEditingUser(null)
				}}
				onSave={handleSaveUser}
			/>
		</div>
	)
}

export default MainUsers