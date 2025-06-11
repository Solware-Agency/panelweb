import React from 'react'

const CalendarPage: React.FC = () => {
	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6">Calendario</h1>
			<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-6 transition-colors duration-300">
				<p className="text-gray-600 dark:text-gray-400">Contenido del calendario aquí...</p>
			</div>
		</div>
	)
}

export default CalendarPage