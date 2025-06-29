import React, { useState } from 'react'
import { Users, Mail, Calendar, Search, Filter, UserCheck, UserX, Crown, Briefcase, Eye, EyeOff, Key, MapPin } from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { updateUserRole, updateUserBranch, canManageUsers, getUserByEmail } from '@lib/supabase/user-management'
import { useAuth } from '@app/providers/AuthContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'

interface UserProfile {
	id: string
	email: string
	role: 'owner' | 'employee'
	created_at: string
	updated_at: string
	email_confirmed_at?: string
	last_sign_in_at?: string
	password?: string // Campo para almacenar la contraseña (solo para visualización)
	assigned_branch?: string | null
}

const MainUsers: React.FC = () => {
	const { user: currentUser } = useAuth()
	const { toast } = useToast()
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('all')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [branchFilter, setbranchFilter] = useState<string>('all')
	const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({})
	const [searchEmail, setSearchEmail] = useState('')
	const [isSearching, setIsSearching] = useState(false)

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

				// Simular contraseñas para demostración (en un sistema real, nunca se deberían mostrar contraseñas)
				// Esto es solo para fines de demostración
				const usersWithPasswords = profiles?.map(profile => ({
					...profile,
					email_confirmed_at: null, // Placeholder - requiere permisos admin
					last_sign_in_at: null, // Placeholder - requiere permisos admin
					password: '********' // Contraseña simulada para demostración
				})) || []

				return usersWithPasswords
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

	const handleSearchUser = async () => {
		if (!searchEmail.trim()) {
			toast({
				title: '❌ Email requerido',
				description: 'Por favor ingresa un email para buscar.',
				variant: 'destructive',
			})
			return
		}

		setIsSearching(true)
		try {
			const { data, error } = await getUserByEmail(searchEmail.trim())
			
			if (error || !data) {
				toast({
					title: '❌ Usuario no encontrado',
					description: 'No se encontró ningún usuario con ese email.',
					variant: 'destructive',
				})
				return
			}

			// Si se encuentra, actualizar la lista filtrando solo ese usuario
			setSearchTerm(searchEmail.trim())
			
			toast({
				title: '✅ Usuario encontrado',
				description: `Se encontró el usuario ${data.email}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error searching user:', error)
			toast({
				title: '❌ Error en la búsqueda',
				description: 'Hubo un problema al buscar el usuario. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsSearching(false)
		}
	}

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

	const getBranchColor = (branch: string | null | undefined) => {
		if (!branch) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
		
		switch (branch) {
			case 'PMG':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			case 'CPC':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'CNX':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
			case 'STX':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
			case 'MCY':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
		}
	}

	const togglePasswordVisibility = (userId: string) => {
		setPasswordVisibility(prev => ({
			...prev,
			[userId]: !prev[userId]
		}))
	}

	const handleRoleChange = async (userId: string, newRole: 'owner' | 'employee') => {
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
		if (userId === currentUser?.id) {
			toast({
				title: '❌ Acción no permitida',
				description: 'No puedes cambiar tu propio rol.',
				variant: 'destructive',
			})
			return
		}

		try {
			const { error } = await updateUserRole(userId, newRole)
			
			if (error) {
				throw error
			}

			toast({
				title: '✅ Rol actualizado',
				description: `El rol del usuario ha sido cambiado a ${newRole === 'owner' ? 'Propietario' : 'Empleado'}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Refrescar la lista de usuarios
			refetch()
		} catch (error) {
			console.error('Error updating user role:', error)
			toast({
				title: '❌ Error al actualizar',
				description: 'Hubo un problema al cambiar el rol del usuario. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		}
	}

	const handleBranchChange = async (userId: string, branch: string | null) => {
		// Verificar permisos antes de permitir edición
		if (!canManage) {
			toast({
				title: '❌ Sin permisos',
				description: 'No tienes permisos para editar usuarios.',
				variant: 'destructive',
			})
			return
		}

		try {
			const { error } = await updateUserBranch(userId, branch === 'none' ? null : branch)
			
			if (error) {
				throw error
			}

			toast({
				title: '✅ Sede actualizada',
				description: branch === 'none' 
					? 'Se ha eliminado la restricción de sede para este usuario.' 
					: `La sede del usuario ha sido cambiada a ${branch}.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Refrescar la lista de usuarios
			refetch()
		} catch (error) {
			console.error('Error updating user branch:', error)
			toast({
				title: '❌ Error al actualizar',
				description: 'Hubo un problema al cambiar la sede del usuario. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		}
	}

	// Filtrar usuarios
	const filteredUsers = users?.filter(user => {
		const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesRole = roleFilter === 'all' || user.role === roleFilter
		const matchesStatus = statusFilter === 'all' || 
			(statusFilter === 'verified' && user.email_confirmed_at) ||
			(statusFilter === 'unverified' && !user.email_confirmed_at)
		const matchesBranch = branchFilter === 'all' || 
			(branchFilter === 'assigned' && user.assigned_branch) ||
			(branchFilter === 'unassigned' && !user.assigned_branch) ||
			user.assigned_branch === branchFilter
		
		return matchesSearch && matchesRole && matchesStatus && matchesBranch
	}) || []

	// Estadísticas
	const stats = {
		total: users?.length || 0,
		owners: users?.filter(u => u.role === 'owner').length || 0,
		employees: users?.filter(u => u.role === 'employee').length || 0,
		verified: users?.filter(u => u.email_confirmed_at).length || 0,
		withBranch: users?.filter(u => u.assigned_branch).length || 0,
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
								<MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Con Sede Asignada</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
								{stats.withBranch}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Búsqueda por email específico */}
			<Card className="hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg mb-6">
				<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
					<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Buscar Usuario Específico</h3>
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								type="email"
								placeholder="Ingresa el email exacto del usuario..."
								value={searchEmail}
								onChange={(e) => setSearchEmail(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button 
							onClick={handleSearchUser}
							disabled={isSearching}
							className="bg-primary hover:bg-primary/80"
						>
							{isSearching ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Buscando...
								</>
							) : (
								<>
									<Search className="w-4 h-4 mr-2" />
									Buscar Usuario
								</>
							)}
						</Button>
					</div>
					<div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
						Ejemplo: andreoneuge@gmail.com
					</div>
				</div>
			</Card>

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

						{/* Filtro por sede */}
						<div className="flex items-center gap-2">
							<Select value={branchFilter} onValueChange={setbranchFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Filtrar por sede" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todas las sedes</SelectItem>
									<SelectItem value="assigned">Con sede asignada</SelectItem>
									<SelectItem value="unassigned">Sin sede asignada</SelectItem>
									<SelectItem value="PMG">PMG</SelectItem>
									<SelectItem value="CPC">CPC</SelectItem>
									<SelectItem value="CNX">CNX</SelectItem>
									<SelectItem value="STX">STX</SelectItem>
									<SelectItem value="MCY">MCY</SelectItem>
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

									{/* Sede asignada */}
									<div className="flex items-center gap-2 mb-2">
										<MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<div className="flex items-center gap-2">
											{user.assigned_branch ? (
												<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getBranchColor(user.assigned_branch)}`}>
													{user.assigned_branch}
												</span>
											) : (
												<span className="text-sm text-gray-500 dark:text-gray-400">Sin sede asignada</span>
											)}
										</div>
									</div>

									{/* Contraseña */}
									<div className="flex items-center gap-2 mb-2">
										<Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<div className="flex items-center gap-2">
											<p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
												{passwordVisibility[user.id] ? 'contraseña123' : '********'}
											</p>
											<button 
												onClick={() => togglePasswordVisibility(user.id)}
												className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
											>
												{passwordVisibility[user.id] ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>

									{/* Fecha de registro */}
									<div className="flex items-center gap-2 mb-3">
										<Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Registrado: {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
										</p>
									</div>

									{/* Selector de rol */}
									{canManage && user.id !== currentUser?.id && (
										<div className="mt-3">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Cambiar Rol:
											</label>
											<Select 
												defaultValue={user.role} 
												onValueChange={(value: 'owner' | 'employee') => handleRoleChange(user.id, value)}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Seleccionar rol" />
												</SelectTrigger>
												<SelectContent>
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
									)}

									{/* Selector de sede */}
									{canManage && (
										<div className="mt-3">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Asignar Sede:
											</label>
											<Select 
												defaultValue={user.assigned_branch || 'none'} 
												onValueChange={(value) => handleBranchChange(user.id, value === 'none' ? null : value)}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Seleccionar sede" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">Sin restricción de sede</SelectItem>
													<SelectItem value="PMG">PMG</SelectItem>
													<SelectItem value="CPC">CPC</SelectItem>
													<SelectItem value="CNX">CNX</SelectItem>
													<SelectItem value="STX">STX</SelectItem>
													<SelectItem value="MCY">MCY</SelectItem>
												</SelectContent>
											</Select>
										</div>
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
										Contraseña
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Rol
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Sede Asignada
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Estado
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Fecha de Registro
									</th>
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
											<div className="flex items-center gap-2">
												<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
													{passwordVisibility[user.id] ? 'contraseña123' : '********'}
												</p>
												<button 
													onClick={() => togglePasswordVisibility(user.id)}
													className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
												>
													{passwordVisibility[user.id] ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</button>
											</div>
										</td>
										<td className="px-6 py-4">
											{canManage && user.id !== currentUser?.id ? (
												<Select 
													defaultValue={user.role} 
													onValueChange={(value: 'owner' | 'employee') => handleRoleChange(user.id, value)}
												>
													<SelectTrigger className="w-40">
														<SelectValue placeholder="Seleccionar rol" />
													</SelectTrigger>
													<SelectContent>
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
											) : (
												<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
													{getRoleIcon(user.role)}
													{user.role === 'owner' ? 'Propietario' : 'Empleado'}
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											{canManage ? (
												<Select 
													defaultValue={user.assigned_branch || 'none'} 
													onValueChange={(value) => handleBranchChange(user.id, value === 'none' ? null : value)}
												>
													<SelectTrigger className="w-40">
														<SelectValue placeholder="Seleccionar sede" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="none">Sin restricción</SelectItem>
														<SelectItem value="PMG">PMG</SelectItem>
														<SelectItem value="CPC">CPC</SelectItem>
														<SelectItem value="CNX">CNX</SelectItem>
														<SelectItem value="STX">STX</SelectItem>
														<SelectItem value="MCY">MCY</SelectItem>
													</SelectContent>
												</Select>
											) : (
												user.assigned_branch ? (
													<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getBranchColor(user.assigned_branch)}`}>
														<MapPin className="w-3 h-3" />
														{user.assigned_branch}
													</span>
												) : (
													<span className="text-sm text-gray-500 dark:text-gray-400">Sin restricción</span>
												)
											)}
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

			{/* Instrucciones */}
			<div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Instrucciones de Uso</h3>
				<ul className="list-disc list-inside space-y-2 text-sm text-blue-700 dark:text-blue-400">
					<li>
						<strong>Asignación de Sede:</strong> Los empleados con una sede asignada solo podrán ver los casos médicos de esa sede.
					</li>
					<li>
						<strong>Sin Restricción:</strong> Los empleados sin sede asignada pueden ver todos los casos.
					</li>
					<li>
						<strong>Propietarios:</strong> Los usuarios con rol de propietario siempre pueden ver todos los casos, independientemente de la sede asignada.
					</li>
					<li>
						<strong>Ejemplo:</strong> El usuario andreoneuge@gmail.com con sede asignada CPC solo podrá ver los casos de la sede CPC.
					</li>
				</ul>
			</div>
		</div>
	)
}

export default MainUsers