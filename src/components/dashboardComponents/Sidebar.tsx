import React from 'react'
import { Code2, Home, PieChart, Calendar as CalendarIcon, Settings, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Sidebar: React.FC = () => {
	const navigate = useNavigate()

	return (
		<aside className="bg-white/80 dark:bg-gray-900/80 flex flex-col justify-between sticky top-0 left-0 h-screen py-8 px-5 gap-4 w-64 border-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-300">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-center items-center gap-3 mb-5">
					<Code2 className="size-8" />
					<p className="text-2xl font-bold">Solware</p>
				</div>
				<div className="flex justify-between items-center gap-3 cursor-pointer text-blue-500 border-l border-blue-500 pl-2 transition w-full">
					<button className="flex gap-3" onClick={() => navigate('/')}>
						<Home className="stroke-2 size-5" />
						<p className="text-md">Inicio</p>
					</button>
					<ChevronRight />
				</div>
				<div
					className="flex justify-center items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition"
					onClick={() => navigate('/stats')}
				>
					<PieChart className="stroke-2 size-5" />
					<p className="text-md">Estadisticas</p>
				</div>
				<div
					className="flex justify-center items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition"
					onClick={() => navigate('/calendar')}
				>
					<CalendarIcon className="stroke-2 size-5" />
					<p className="text-md">Calendario</p>
				</div>
			</div>
			<div className="flex items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition">
				<Settings className="stroke-2 size-5" />
				<p className="text-md">Configuraciones</p>
			</div>
		</aside>
	)
}

export default Sidebar
