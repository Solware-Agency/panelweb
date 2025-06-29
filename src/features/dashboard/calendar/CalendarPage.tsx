import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import { Card } from '@shared/components/ui/card'

const CalendarPage: React.FC = () => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [showYearPicker, setShowYearPicker] = useState(false)

	// Mock events data
	const events = [
		{
			id: 1,
			title: 'Reunión con cliente TechCorp',
			time: '10:00 AM - 11:30 AM',
			date: '2024-01-15',
			type: 'meeting',
			location: 'Oficina Principal',
			attendees: 3,
			color: 'blue',
		},
		{
			id: 2,
			title: 'Entrega proyecto StartupXYZ',
			time: '2:00 PM - 3:00 PM',
			date: '2024-01-15',
			type: 'deadline',
			location: 'Virtual',
			attendees: 2,
			color: 'green',
		},
		{
			id: 3,
			title: 'Revisión semanal del equipo',
			time: '4:00 PM - 5:00 PM',
			date: '2024-01-16',
			type: 'meeting',
			location: 'Sala de Conferencias',
			attendees: 5,
			color: 'purple',
		},
		{
			id: 4,
			title: 'Desarrollo nueva funcionalidad',
			time: '9:00 AM - 12:00 PM',
			date: '2024-01-17',
			type: 'work',
			location: 'Oficina',
			attendees: 1,
			color: 'orange',
		},
	]

	const getDaysInMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	}

	const getFirstDayOfMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
	}

	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentDate((prev) => {
			const newDate = new Date(prev)
			if (direction === 'prev') {
				newDate.setMonth(prev.getMonth() - 1)
			} else {
				newDate.setMonth(prev.getMonth() + 1)
			}
			return newDate
		})
	}

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}

	const getEventsForDate = (date: Date) => {
		const dateString = date.toISOString().split('T')[0]
		return events.filter((event) => event.date === dateString)
	}

	// Year picker functionality
	const currentYear = new Date().getFullYear()
	const startYear = 1950
	const endYear = currentYear + 10
	
	const handleYearSelect = (year: number) => {
		setCurrentDate(new Date(year, currentDate.getMonth(), 1))
		setShowYearPicker(false)
	}

	const generateYearGrid = () => {
		const years = []
		for (let year = startYear; year <= endYear; year++) {
			years.push(year)
		}
		return years
	}

	const renderYearPicker = () => {
		const years = generateYearGrid()
		const selectedYear = currentDate.getFullYear()
		
		return (
			<div className="absolute top-0 left-0 right-0 bottom-0 bg-white dark:bg-background z-10 rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Seleccionar Año</h3>
					<button
						onClick={() => setShowYearPicker(false)}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						<ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
				</div>
				
				<div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
					{years.map((year) => (
						<button
							key={year}
							onClick={() => handleYearSelect(year)}
							className={`p-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
								year === selectedYear
									? 'bg-blue-500 text-white shadow-lg'
									: year === currentYear
									? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
							}`}
						>
							{year}
						</button>
					))}
				</div>
				
				<div className="mt-4 flex justify-center">
					<button
						onClick={() => handleYearSelect(currentYear)}
						className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
					>
						Ir a {currentYear}
					</button>
				</div>
			</div>
		)
	}

	const renderCalendarDays = () => {
		const daysInMonth = getDaysInMonth(currentDate)
		const firstDay = getFirstDayOfMonth(currentDate)
		const days = []

		// Empty cells for days before the first day of the month
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 lg:h-24"></div>)
		}

		// Days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
			const dayEvents = getEventsForDate(date)
			const isSelected = selectedDate.toDateString() === date.toDateString()
			const isToday = new Date().toDateString() === date.toDateString()

			days.push(
				<div
					key={day}
					className={`h-16 sm:h-20 lg:h-24 p-1 sm:p-2 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
						isSelected
							? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
							: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
					} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
					onClick={() => setSelectedDate(date)}
				>
					<div
						className={`text-xs sm:text-sm font-medium mb-1 ${
							isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
						}`}
					>
						{day}
					</div>
					<div className="space-y-1">
						{dayEvents.slice(0, 2).map((event) => (
							<div
								key={event.id}
								className={`text-xs p-1 rounded truncate ${
									event.color === 'blue'
										? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
										: event.color === 'green'
											? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
											: event.color === 'purple'
												? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
												: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
								}`}
							>
								{event.title}
							</div>
						))}
						{dayEvents.length > 2 && (
							<div className="text-xs text-gray-500 dark:text-gray-400">+{dayEvents.length - 2} más</div>
						)}
					</div>
				</div>,
			)
		}

		return days
	}

	const selectedDateEvents = getEventsForDate(selectedDate)

	return (
		<div className="p-3 sm:p-6">
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
				{/* Calendar Grid */}
				<Card className="xl:col-span-2 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-3 sm:p-6 transition-colors duration-300 relative">
						{/* Show year picker overlay if active */}
						{showYearPicker && renderYearPicker()}
						
						{/* Calendar Header */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<div className="flex items-center gap-3 mb-3 sm:mb-0">
								<button
									onClick={() => setShowYearPicker(true)}
									className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
								>
									{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
								</button>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => navigateMonth('prev')}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
								</button>
								<button
									onClick={() => setCurrentDate(new Date())}
									className="px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
								>
									Hoy
								</button>
								<button
									onClick={() => navigateMonth('next')}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								>
									<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
								</button>
							</div>
						</div>

						{/* Calendar Grid */}
						<div className="grid grid-cols-7 gap-0 mb-4">
							{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
								<div
									key={day}
									className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
								>
									{day}
								</div>
							))}
						</div>
						<div className="grid grid-cols-7 gap-0 overflow-hidden">{renderCalendarDays()}</div>
					</div>
				</Card>

				{/* Event Details Sidebar */}
				<div className="space-y-4 sm:space-y-6">
					{/* Add Event Button */}
					<Card className="grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
						<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
							<button className="relative h-12 overflow-hidden p-[1px] w-full bg-white dark:bg-background text-gray-700 dark:text-white rounded-full transition flex items-center justify-center gap-2 text-sm sm:text-base hover:translate-y-[-2px] hover:shadow-sm hover:shadow-primary border border-primary">
								<Plus className="w-4 h-4 sm:w-5 sm:h-5" />
								<span className="text-sm sm:text-base">Nuevo Evento</span>
							</button>
						</div>
					</Card>
					{/* Selected Date Events */}
					<Card className="grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
						<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
							<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
								{formatDate(selectedDate)}
							</h3>

							{selectedDateEvents.length > 0 ? (
								<div className="space-y-4">
									{selectedDateEvents.map((event) => (
										<div
											key={event.id}
											className={`p-3 sm:p-4 rounded-lg border-l-4 ${
												event.color === 'blue'
													? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
													: event.color === 'green'
														? 'bg-green-50 dark:bg-green-900/20 border-green-500'
														: event.color === 'purple'
															? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
															: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
											}`}
										>
											<h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">
												{event.title}
											</h4>
											<div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
												<div className="flex items-center gap-2">
													<Clock className="w-3 h-3 sm:w-4 sm:h-4" />
													{event.time}
												</div>
												<div className="flex items-center gap-2">
													<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
													{event.location}
												</div>
												<div className="flex items-center gap-2">
													<Users className="w-3 h-3 sm:w-4 sm:h-4" />
													{event.attendees} participantes
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-6 sm:py-8">
									<CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
									<p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No hay eventos para este día</p>
								</div>
							)}
						</div>
					</Card>
					{/* Upcoming Events */}
					<Card className="grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
						<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
							<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">Próximos Eventos</h3>
							<div className="space-y-3">
								{events.slice(0, 3).map((event) => (
									<div
										key={event.id}
										className="flex items-center gap-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition"
									>
										<div
											className={`w-3 h-3 rounded-full ${
												event.color === 'blue'
													? 'bg-blue-500'
													: event.color === 'green'
														? 'bg-green-500'
														: event.color === 'purple'
															? 'bg-purple-500'
															: 'bg-orange-500'
											}`}
										></div>
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-700 dark:text-gray-300">{event.title}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default CalendarPage