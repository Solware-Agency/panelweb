import React from 'react'
import { Code2, Home, PieChart, Calendar as CalendarIcon, Settings, ChevronRight } from 'lucide-react'

const Sidebar: React.FC = () => {
	return (
		<aside className="bg-white/80 dark:bg-gray-900/80 flex flex-col justify-between h-screen py-8 px-5 gap-4 w-64 border-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-300">
			<div className="flex flex-col items-start gap-6">
				<div className="flex justify-center items-center gap-3 mb-5">
					<Code2 className="size-8" />
					<p className="text-2xl font-bold">Solware</p>
				</div>
				<div className="flex justify-between items-center gap-3 cursor-pointer text-blue-500 border-l border-blue-500 pl-2 transition w-full">
					<div className="flex gap-3">
						<Home className="stroke-2 size-5" />
						<p className="text-md">Inicio</p>
					</div>
					<ChevronRight />
				</div>
				<div className="flex justify-center items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition">
					<PieChart className="stroke-2 size-5" />
					<p className="text-md">Estadisticas</p>
				</div>
				<div className="flex justify-center items-center gap-3 cursor-pointer pl-2 hover:text-blue-500 transition">
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
