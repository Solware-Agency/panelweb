import React from 'react'
import {
	Code2,
	Home,
	PieChart,
	Calendar as CalendarIcon,
	// Settings,
	FileText,
	X,
	FolderInput,
	LogOut,
	Moon,
	Sun,
	Clock,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'

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

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	return (
		<aside className="bg-white/80 dark:bg-gray-900 flex flex-col justify-between h-screen py-8 px-5 gap-4 border-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out overflow-hidden">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-between items-center w-full mb-5">
					<div className="flex items-center gap-3">
						<Code2 className="size-8 shrink-0 -ml-1" />
						<p
							className={`text-2xl font-bold whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Solware
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

				<NavLink
					to="/dashboard/home"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
							isActive ? 'text-blue-500 border-blue-500' : 'hover:text-blue-500'
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
							isActive ? 'text-blue-500 border-blue-500' : 'hover:text-blue-500'
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
					to="/dashboard/calendar"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
							isActive ? 'text-blue-500 border-blue-500' : 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
					title={!showFullContent ? 'Calendario' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<CalendarIcon className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Calendario
						</p>
					</div>
				</NavLink>

				<NavLink
					to="/dashboard/reports"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
							isActive ? 'text-blue-500 border-blue-500' : 'hover:text-blue-500'
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
					to="/dashboard/cases"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full ${
							isActive ? 'text-blue-500 border-blue-500' : 'hover:text-blue-500'
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
			</div>

			<div className="flex flex-col justify-center gap-4">
				{/* <div
					className="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition"
					title={!showFullContent ? 'Configuraciones' : undefined}
				>
					<Settings className="stroke-2 size-5 shrink-0" />
					<p
						className={`text-md whitespace-nowrap transition-all duration-300 ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						Configuraciones
					</p>
				</div> */}
				<div
					onClick={handleLogout}
					title={!showFullContent ? 'Fecha' : undefined}
					className="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition"
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
					className="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition"
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
