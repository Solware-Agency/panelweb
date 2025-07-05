import React from 'react'
import {
	FileText,
	X,
	LogOut,
	Moon,
	Sun,
	Settings,
	Users,
	Home,
	Microscope,
	Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'
import FavIcon from '@shared/components/icons/FavIcon'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { useDarkMode } from '@shared/hooks/useDarkMode'

interface FormSidebarProps {
	onClose?: () => void
	isExpanded?: boolean
	isMobile?: boolean
	onSectionClick: (section: string) => void
	activeSection: string
}

const FormSidebar: React.FC<FormSidebarProps> = ({
	onClose,
	isExpanded = false,
	isMobile = false,
	onSectionClick,
	activeSection
}) => {
	// For mobile, always show full sidebar. For desktop, use isExpanded state
	const showFullContent = isMobile || isExpanded
	const navigate = useNavigate()
	const { profile } = useUserProfile()
	const { isDark, setIsDark } = useDarkMode()
	const currentDate = new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	const toggleDarkMode = () => {
		setIsDark(!isDark)
	}

	return (
		<aside className="bg-white/80 dark:bg-background/50 shadow-lg hover:shadow-primary/50 backdrop-blur-[10px] flex flex-col justify-between h-screen py-4 sm:py-8 px-3 sm:px-5 gap-4 border-gray-600 text-gray-700 dark:text-white transition-all duration-300 ease-in-out overflow-hidden border-r border-input">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-between items-center w-full mb-3 sm:mb-5">
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
							className="lg:hidden ml-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				{/* Form Sections */}
				<button
					onClick={() => onSectionClick('patient')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'patient' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
					title={!showFullContent ? 'Datos del Paciente' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<Users className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Datos del Paciente
						</p>
					</div>
				</button>

				<button
					onClick={() => onSectionClick('service')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'service' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
					title={!showFullContent ? 'Servicio' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<Microscope className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Servicio
						</p>
					</div>
				</button>

				<button
					onClick={() => onSectionClick('payment')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'payment' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
					title={!showFullContent ? 'Pago' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<FileText className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Pago
						</p>
					</div>
				</button>

				<button
					onClick={() => onSectionClick('comments')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'comments' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
					title={!showFullContent ? 'Comentarios' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<FileText className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Comentarios
						</p>
					</div>
				</button>

				<button
					onClick={() => onSectionClick('records')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'records' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
					title={!showFullContent ? 'Registros' : undefined}
				>
					<div className="flex gap-3 items-center min-w-0">
						<Home className="stroke-2 size-5 shrink-0" />
						<p
							className={`text-md whitespace-nowrap transition-all duration-300 ${
								showFullContent ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
							}`}
						>
							Registros
						</p>
					</div>
				</button>

				<button
					onClick={() => onSectionClick('settings')}
					className={`flex justify-between items-center gap-2 sm:gap-3 cursor-pointer transition w-full py-2 px-1 rounded-md ${
						activeSection === 'settings' ? 'text-primary border-primary' : 'hover:text-primary'
					}`}
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
				</button>
			</div>

			<div className="flex flex-col justify-center gap-4">
				<div
					title={!showFullContent ? 'Fecha' : undefined}
					className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:text-primary transition py-2 px-1 rounded-md"
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
					className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:text-primary transition py-2 px-1 rounded-md"
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
					className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:text-red-500 transition py-2 px-1 rounded-md"
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

export default FormSidebar