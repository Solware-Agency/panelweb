import React from 'react'
import { Code2, Home, PieChart, Calendar as CalendarIcon, Settings, FileText, X, FolderInput } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
	onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
	return (
		<aside className="bg-white/80 dark:bg-gray-900 flex flex-col justify-between h-screen py-8 px-5 gap-4 border-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-300">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-between items-center w-full mb-5">
					<div className="flex items-center gap-3">
						<Code2 className="size-8" />
						<p className="text-2xl font-bold">Solware</p>
					</div>
					{/* Close button for mobile */}
					{onClose && (
						<button
							onClick={onClose}
							className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>
				
				<NavLink
					to="/dashboard/home"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full pl-2 ${
							isActive
								? 'text-blue-500 border-l border-blue-500'
								: 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
				>
					<div className="flex gap-3 items-center">
						<Home className="stroke-2 size-5" />
						<p className="text-md">Inicio</p>
					</div>
				</NavLink>
				
				<NavLink
					to="/dashboard/stats"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full pl-2 ${
							isActive
								? 'text-blue-500 border-l border-blue-500'
								: 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
				>
					<div className="flex gap-3 items-center">
						<PieChart className="stroke-2 size-5" />
						<p className="text-md">Estadisticas</p>
					</div>
				</NavLink>
				
				<NavLink
					to="/dashboard/calendar"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full pl-2 ${
							isActive
								? 'text-blue-500 border-l border-blue-500'
								: 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
				>
					<div className="flex gap-3 items-center">
						<CalendarIcon className="stroke-2 size-5" />
						<p className="text-md">Calendario</p>
					</div>
				</NavLink>
				
				<NavLink
					to="/dashboard/reports"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full pl-2 ${
							isActive
								? 'text-blue-500 border-l border-blue-500'
								: 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
				>
					<div className="flex gap-3 items-center">
						<FileText className="stroke-2 size-5" />
						<p className="text-md">Reportes</p>
					</div>
				</NavLink>
				<NavLink
					to="/dashboard/cases"
					className={({ isActive }) =>
						`flex justify-between items-center gap-3 cursor-pointer transition w-full pl-2 ${
							isActive
								? 'text-blue-500 border-l border-blue-500'
								: 'hover:text-blue-500'
						}`
					}
					onClick={onClose}
				>
					<div className="flex gap-3 items-center">
						<FolderInput className="stroke-2 size-5" />
						<p className="text-md">Casos</p>
					</div>
				</NavLink>
			</div>
			
			<div className="flex items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition">
				<Settings className="stroke-2 size-5" />
				<p className="text-md">Configuraciones</p>
			</div>
		</aside>
	)
}

export default Sidebar