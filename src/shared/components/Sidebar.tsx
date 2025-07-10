import React from 'react'
import {
	Home,
	PieChart,
	FileText,
	X,
	FolderInput,
	LogOut,
	Microscope,
	Moon,
	Sun,
	Clock,
	Users,
	Settings,
	History,
	User,
	ChevronDown,
	ChevronRight,
	Folder,
} from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@app/providers/AuthContext'
import FavIcon from '@shared/components/icons/FavIcon'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { cn } from '@shared/lib/cn'

interface NavItemProps {
	to: string
	icon: React.ReactNode
	label: string
	showFullContent: boolean
	onClick?: () => void
	title?: string
}

interface NavGroupProps {
	icon: React.ReactNode
	label: string
	showFullContent: boolean
	isExpanded: boolean
	onToggle: () => void
	children: React.ReactNode
	childPaths: string[] // Array de rutas de los items hijos
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, showFullContent, onClick, title }) => {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer w-full py-2 px-1 rounded-md ${
					isActive ? 'text-primary border-primary' : 'hover:text-primary'
				}`
			}
			onClick={onClick}
			title={!showFullContent ? title || label : undefined}
		>
			<div className="flex gap-3 items-center min-w-0">
				{icon}
				<p
					className={`text-md whitespace-nowrap ${
						showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
					}`}
				>
					{label}
				</p>
			</div>
		</NavLink>
	)
}

const NavGroup: React.FC<NavGroupProps> = ({
	icon,
	label,
	showFullContent,
	isExpanded,
	onToggle,
	children,
	childPaths,
}) => {
	const location = useLocation()

	// Verificar si algún item hijo está activo
	const isChildActive = childPaths.some((path) => location.pathname === path)

	return (
		<div className="space-y-1">
			<button
				onClick={onToggle}
				className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer w-full py-2 px-1 rounded-md ${
					isExpanded || isChildActive ? 'text-primary' : 'hover:text-primary'
				}`}
				title={!showFullContent ? label : undefined}
			>
				<div className="flex gap-3 items-center min-w-0">
					{icon}
					<p
						className={`text-md whitespace-nowrap ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						{label}
					</p>
				</div>
				{showFullContent && (
					<div className="transition-transform duration-200">
						{isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
					</div>
				)}
			</button>

			<div
				className={cn(
					'pl-2 space-y-1 overflow-hidden transition-all duration-200',
					isExpanded ? 'max-h-96' : 'max-h-0',
				)}
			>
				{children}
			</div>
		</div>
	)
}

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
	const location = useLocation()
	const { signOut } = useAuth()
	const { profile } = useUserProfile()

	// Definir las rutas de cada grupo
	const clinicalPaths = ['/dashboard/cases', '/dashboard/my-cases', '/dashboard/patients', '/patients']
	const reportsPaths = ['/dashboard/stats', '/dashboard/reports', '/dashboard/changelog']

	// Verificar si algún item de cada grupo está activo
	const isClinicalActive = clinicalPaths.some((path) => location.pathname === path)
	const isReportsActive = reportsPaths.some((path) => location.pathname === path)

	const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
		clinical: true,
		reports: false,
	})

	const toggleGroup = (groupName: string) => {
		setExpandedGroups((prev) => {
			const isCurrentlyExpanded = prev[groupName]
			// Si el grupo actual está expandido, lo cerramos
			if (isCurrentlyExpanded) {
				return {
					...prev,
					[groupName]: false,
				}
			}
			// Si el grupo actual está cerrado, lo abrimos y cerramos todos los demás
			else {
				const newState: Record<string, boolean> = {}
				Object.keys(prev).forEach((key) => {
					newState[key] = key === groupName
				})
				return newState
			}
		})
	}

	// Auto-expandir grupos cuando un item hijo está activo
	React.useEffect(() => {
		// Solo auto-expandir si el sidebar está expandido (showFullContent es true)
		if (showFullContent) {
			if (isClinicalActive && !expandedGroups.clinical) {
				setExpandedGroups((prev) => {
					const newState: Record<string, boolean> = {}
					Object.keys(prev).forEach((key) => {
						newState[key] = key === 'clinical'
					})
					return newState
				})
			}
			if (isReportsActive && !expandedGroups.reports) {
				setExpandedGroups((prev) => {
					const newState: Record<string, boolean> = {}
					Object.keys(prev).forEach((key) => {
						newState[key] = key === 'reports'
					})
					return newState
				})
			}
		}
	}, [
		location.pathname,
		isClinicalActive,
		isReportsActive,
		expandedGroups.clinical,
		expandedGroups.reports,
		showFullContent,
	])

	// Collapse all groups when sidebar is collapsed
	React.useEffect(() => {
		if (!showFullContent) {
			setExpandedGroups({
				clinical: false,
				reports: false,
			})
		}
	}, [showFullContent])

	const handleLogout = async () => {
		await signOut()
		// Clear session storage
		localStorage.removeItem('last_activity_time')
		localStorage.removeItem('session_expiry_time')
		localStorage.removeItem('session_timeout_minutes')
		navigate('/')
	}

	// Determine if user is admin role
	const isAdmin = profile?.role === 'admin'
	const isOwner = profile?.role === 'owner'
	const isEmployee = profile?.role === 'employee'

	return (
		<aside className="bg-white/80 dark:bg-background/50 shadow-lg hover:shadow-primary/50 backdrop-blur-[10px] flex flex-col justify-between h-screen py-4 sm:py-6 px-2 sm:px-4 gap-4 border-gray-600 text-gray-700 dark:text-white ease-in-out overflow-hidden border-r border-input">
			<div className="flex flex-col items-start gap-4">
							<div className="flex justify-between items-center w-full mb-2 sm:mb-4">
				<a 
					href="https://conspat.solware.agency/" 
					target="_blank" 
					rel="noopener noreferrer"
					className="flex items-center gap-3 hover:opacity-80 transition-opacity"
				>
					<FavIcon fill="#e82084" className="size-8 shrink-0 -ml-1" />
					<p
						className={`text-2xl font-bold whitespace-nowrap ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						Conspat
					</p>
				</a>
					{/* Close button for mobile */}
					{onClose && isMobile && (
						<button
							onClick={onClose}
							className="lg:hidden ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				<div className="flex flex-col justify-center gap-4">
					{/* Common menu items for all roles */}
					{!isEmployee && !isAdmin && (
						<div className="py-1">
							<NavItem
								to="/dashboard/home"
								icon={<Home className="stroke-2 size-5 shrink-0" />}
								label="Inicio"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
						</div>
					)}

					{/* Employee specific routes */}
					{isEmployee && (
						<>
							<NavItem
								to="/form"
								icon={<FileText className="stroke-2 size-5 shrink-0" />}
								label="Formulario"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
							<NavItem
								to="/form/records"
								icon={<FolderInput className="stroke-2 size-5 shrink-0" />}
								label="Registros"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
							<NavItem
								to="/form/doctors"
								icon={<User className="stroke-2 size-5 shrink-0" />}
								label="Médicos"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
							<NavItem
								to="/form/patients"
								icon={<Users className="stroke-2 size-5 shrink-0" />}
								label="Pacientes"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
						</>
					)}

					{/* Clinical Group - Cases, Patients, My Cases */}
					{(isAdmin || isOwner) && (
						<NavGroup
							icon={<Folder className="stroke-2 size-4 sm:size-5 shrink-0" />}
							label="Clínico"
							showFullContent={showFullContent}
							isExpanded={expandedGroups.clinical}
							onToggle={() => toggleGroup('clinical')}
							childPaths={clinicalPaths}
						>
							{/* Cases - For all roles */}
							<NavItem
								to="/dashboard/cases"
								icon={<FolderInput className="stroke-2 size-5 shrink-0" />}
								label="Casos"
								showFullContent={showFullContent}
								onClick={onClose}
							/>

							{/* My Cases - Only for admin */}
							{isAdmin && (
								<NavItem
									to="/dashboard/my-cases"
									icon={<Microscope className="stroke-2 size-5 shrink-0" />}
									label="Mis Casos"
									showFullContent={showFullContent}
									onClick={onClose}
								/>
							)}

							{/* Patients - For all roles */}
							{(isOwner || isEmployee) && (
								<NavItem
									to={isEmployee ? '/patients' : '/dashboard/patients'}
									icon={<User className="stroke-2 size-5 shrink-0" />}
									label="Pacientes"
									showFullContent={showFullContent}
									onClick={onClose}
								/>
							)}
						</NavGroup>
					)}

					{/* Reports Group - Stats, Reports, Changelog */}
					{isOwner && (
						<NavGroup
							icon={<FileText className="stroke-2 size-4 sm:size-5 shrink-0" />}
							label="Análisis"
							showFullContent={showFullContent}
							isExpanded={expandedGroups.reports}
							onToggle={() => toggleGroup('reports')}
							childPaths={reportsPaths}
						>
							<NavItem
								to="/dashboard/stats"
								icon={<PieChart className="stroke-2 size-5 shrink-0" />}
								label="Estadísticas"
								showFullContent={showFullContent}
								onClick={onClose}
							/>

							<NavItem
								to="/dashboard/reports"
								icon={<FileText className="stroke-2 size-5 shrink-0" />}
								label="Reportes"
								showFullContent={showFullContent}
								onClick={onClose}
							/>

							<NavItem
								to="/dashboard/changelog"
								icon={<History className="stroke-2 size-5 shrink-0" />}
								label="Historial"
								showFullContent={showFullContent}
								onClick={onClose}
							/>
						</NavGroup>
					)}

					{/* Users - For owner and admin */}
					{(isOwner || isAdmin) && (
						<NavItem
							to="/dashboard/users"
							icon={<Users className="stroke-2 size-4 sm:size-5 shrink-0" />}
							label="Usuarios"
							showFullContent={showFullContent}
							onClick={onClose}
						/>
					)}
				</div>
			</div>

			<div className="flex flex-col justify-center gap-1">
				{isEmployee && (
					<NavItem
						to="/form/settings"
						icon={<Settings className="stroke-2 size-4 sm:size-5 shrink-0" />}
						label="Ajustes"
						showFullContent={showFullContent}
						onClick={onClose}
					/>
				)}

				{!isEmployee && (
					<NavItem
						to="/dashboard/settings"
						icon={<Settings className="stroke-2 size-4 sm:size-5 shrink-0" />}
						label="Ajustes"
						showFullContent={showFullContent}
						onClick={onClose}
					/>
				)}
				<div
					title={!showFullContent ? 'Fecha' : undefined}
					className="flex items-center gap-2 cursor-pointer hover:text-primary py-2 px-1 rounded-md"
				>
					<Clock className="stroke-2 size-4 sm:size-5 shrink-0" />
					<p
						className={`text-md whitespace-nowrap ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						{currentDate}
					</p>
				</div>
				<div
					onClick={toggleDarkMode}
					title={!showFullContent ? 'Cambiar color' : undefined}
					className="flex items-center gap-2 cursor-pointer hover:text-primary py-2 px-1 rounded-md"
					aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
				>
					{isDark ? (
						<Sun className="stroke-2 size-4 sm:size-5 shrink-0" />
					) : (
						<Moon className="stroke-2 size-4 sm:size-5 shrink-0" />
					)}
					<p
						className={`text-md whitespace-nowrap ${
							showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
						}`}
					>
						{isDark ? 'Claro' : 'Oscuro'}
					</p>
				</div>
				<div
					onClick={handleLogout}
					title={!showFullContent ? 'Salir' : undefined}
					className="flex items-center gap-2 cursor-pointer hover:text-red-500 py-2 px-1 rounded-md"
				>
					<LogOut className="stroke-2 size-4 sm:size-5 shrink-0 text-red-500" />
					<p
						className={`text-md whitespace-nowrap ${
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
