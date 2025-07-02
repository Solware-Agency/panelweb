import React from 'react'
import {
	Home,
	PieChart,
	FileText,
	X,
	FolderInput,
	LogOut,
	Moon,
	Sun,
	Clock,
	Users,
	Settings,
	ShieldCheck,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'
import FavIcon from '@shared/components/icons/FavIcon'
import { useUserProfile } from '@shared/hooks/useUserProfile'

interface SidebarProps {
	onClose?: () => void
	isExpanded?: boolean
	isMobile?: boolean
	isDark: boolean
	currentDate: string
	toggleDarkMode: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
	onClose,
	isExpanded = false,
	isMobile = false,
	isDark,
	toggleDarkMode,
	currentDate,
}) => {
	// For mobile, always show full sidebar. For desktop, use isExpanded state
	const showFullContent = isMobile || isExpanded
	const navigate = useNavigate()
	const { profile } = useUserProfile()

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	// Determine if user is admin role
	const isAdmin = profile?.role === 'admin'

	return (
		<aside className="bg-white/80 dark:bg-background/50 shadow-lg hover:shadow-primary/50 backdrop-blur-[10px] flex flex-col justify-between h-screen py-8 px-5 gap-4 border-gray-600 text-gray-700 dark:text-white transition-all duration-300 ease-in-out overflow-hidden border-r border-input">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-between items-center w-full mb-5">
					<div className="flex items-center gap-3">
						<FavIcon fill='#e82084' className='size-8 shrink-0 -ml-1'/>
						<p
							className={`text-2xl font-bold whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Conspat
						</p>
					</div>
					{/* Close button for mobile */}
					{onClose && isMobile && (
						<button
							onClick={onClose}
							className="lg:hidden ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				{/* Welcome message with display name */}
				{profile?.display_name && (
					<div className={`text-sm text-primary font-medium mb-2 transition-all duration-300 ${
						showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
					}`}>
						Bienvenido, {profile.display_name}
					</div>
				)}

				{/* Show different menu items based on role */}
				{isAdmin ? (
					// Admin menu items
					<>
						<NavLink
							to="/dashboard/cases"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Registros' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<FolderInput className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Registros
								</p>
							</div>
						</NavLink>

						<NavLink
							to="/dashboard/users"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Médicos' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<Users className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Médicos
								</p>
							</div>
						</NavLink>
					</>
				) : (
					// Regular menu items for owner/employee
					<>
						<NavLink
							to="/dashboard/home"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Inicio' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<Home className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Inicio
								</p>
							</div>
						</NavLink>

						<NavLink
							to="/dashboard/stats"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Estadisticas' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<PieChart className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Estadisticas
								</p>
							</div>
						</NavLink>

						<NavLink
							to="/dashboard/reports"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Reportes' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<FileText className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Reportes
								</p>
							</div>
						</NavLink>

						<NavLink
							to="/dashboard/users"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Usuarios' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<Users className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Usuarios
								</p>
							</div>
						</NavLink>

						<NavLink
							to="/dashboard/cases"
							className={({ isActive }) =>
								`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
									isActive ? 'text-primary border-primary' : 'hover:text-primary'
								}`
							}
							onClick={onClose}
							title={!showFullContent ? 'Casos' : undefined}
						>
							<div className="flex gap-3 items-center min-w-0">
								<FolderInput className="stroke-2 size-5 shrink-0" />
								<p
									className={`text-md whitespace-nowrap transition-all duration-300 ${
										showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
									}`}
								>
									Casos
								</p>
							</div>
						</NavLink>
					</>
				)}
			</div>

			<div className="flex flex-col justify-center gap-4">
				<NavLink
					to="/dashboard/settings"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
							isActive ? 'text-primary border-primary' : 'hover:text-primary'
						}`
					}
					onClick={onClose}
					title={!showFullContent ? 'Ajustes' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<Settings className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Ajustes
						</p>
					</div>
				</NavLink>
				<div
					onClick={handleLogout}
					title={!showFullContent ? 'Fecha' : undefined}
					className="flex items-center gap-3 cursor-pointer hover:text-primary transition"
				>
					<Clock className="stroke-2 size-5 shrink-0" />
					<p
						className={`text-md whitespace-nowrap transition-all duration-300 ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						{currentDate}
					</p>
				</div>
				<div
					onClick={toggleDarkMode}
					title={!showFullContent ? 'Cambiar color' : undefined}
					className="flex items-center gap-3 cursor-pointer hover:text-primary transition"
					aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
				>
					{isDark ? <Sun className="stroke-2 size-5 shrink-0" /> : <Moon className="stroke-2 size-5 shrink-0" />}
					<p
						className={`text-md whitespace-nowrap transition-all duration-300 ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						{isDark ? 'Claro' : 'Oscuro'}
					</p>
				</div>
				<div
					onClick={handleLogout}
					title={!showFullContent ? 'Salir' : undefined}
					className="flex items-center gap-3 cursor-pointer hover:text-red-500 transition"
				>
					<LogOut className="stroke-2 size-5 shrink-0 text-red-500" />
					<p
						className={`text-md whitespace-nowrap transition-all duration-300 ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						Salir
					</p>
				</div>
			</div>
		</aside>
	)
}

export default Sidebar