import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@shared/lib/cn'
import { buttonVariants } from '@shared/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	const [showYearPicker, setShowYearPicker] = React.useState(false)
	const [currentMonth, setCurrentMonth] = React.useState(props.defaultMonth || new Date())

	// Year picker functionality
	const currentYear = new Date().getFullYear()
	const startYear = 1900 // Allow selection from 1900
	const endYear = currentYear + 10

	const handleYearSelect = (year: number) => {
		const newDate = new Date(year, currentMonth.getMonth(), 1)
		setCurrentMonth(newDate)
		setShowYearPicker(false)
		// Call the onMonthChange prop if it exists
		props.onMonthChange?.(newDate)
	}

	const generateYearGrid = () => {
		const years = []
		for (let year = startYear; year <= endYear; year++) {
			years.push(year)
		}
		return years.reverse() // Show newest years first
	}

	// Funciones para cambiar de mes
	const handlePrevMonth = () => {
		const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		setCurrentMonth(prevMonth)
		props.onMonthChange?.(prevMonth)
	}

	const handleNextMonth = () => {
		const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		setCurrentMonth(nextMonth)
		props.onMonthChange?.(nextMonth)
	}

	const renderYearPicker = () => {
		const years = generateYearGrid()
		const selectedYear = currentMonth.getFullYear()

		return (
			<div className="absolute top-0 left-0 right-0 bottom-0 bg-white dark:bg-background z-50 rounded-md border shadow-lg p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Seleccionar Año</h3>
					<button
						onClick={() => setShowYearPicker(false)}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						<ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
					</button>
				</div>

				<div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
					{years.map((year) => (
						<button
							key={year}
							onClick={() => handleYearSelect(year)}
							className={`p-2 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 ${
								year === selectedYear
									? 'bg-primary text-primary-foreground shadow-md'
									: year === currentYear
									? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
							}`}
						>
							{year}
						</button>
					))}
				</div>

				<div className="mt-4 flex justify-center gap-2">
					<button
						onClick={() => handleYearSelect(currentYear)}
						className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
					>
						Ir a {currentYear}
					</button>
					<button
						onClick={() => handleYearSelect(2000)}
						className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors"
					>
						Ir a 2000
					</button>
				</div>
			</div>
		)
	}

	// Custom caption component with year picker y flechas de mes
	const CustomCaption = ({ displayMonth }: { displayMonth: Date }) => {
		return (
			<div className="flex justify-center pt-1 relative items-center gap-2">
				<button
					onClick={handlePrevMonth}
					className="absolute left-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
					aria-label="Mes anterior"
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<button
					onClick={() => setShowYearPicker(true)}
					className="text-sm font-medium hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					{displayMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
				</button>
				<button
					onClick={handleNextMonth}
					className="absolute right-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
					aria-label="Mes siguiente"
				>
					<ChevronRight className="w-4 h-4" />
				</button>
			</div>
		)
	}

	return (
		<div className="relative">
			{showYearPicker && renderYearPicker()}
			<DayPicker
				showOutsideDays={showOutsideDays}
				className={cn('p-3', className)}
				month={currentMonth}
				onMonthChange={setCurrentMonth}
				classNames={{
					months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
					month: 'space-y-4',
					caption: 'flex justify-center pt-1 relative items-center',
					caption_label: 'text-sm font-medium',
					nav: 'space-x-1 flex items-center',
					nav_button: cn(
						buttonVariants({ variant: 'outline' }),
						'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
					),
					nav_button_previous: 'absolute left-1',
					nav_button_next: 'absolute right-1',
					table: 'w-full border-collapse space-y-1',
					head_row: 'flex',
					head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
					row: 'flex w-full mt-2',
					cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
					day: cn(
						buttonVariants({ variant: 'ghost' }),
						'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 hover:text-purple-700',
					),
					day_range_end: 'day-range-end',
					day_selected:
						'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
					day_today: 'bg-accent text-accent-foreground',
					day_outside:
						'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
					day_disabled: 'text-muted-foreground opacity-50',
					day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
					day_hidden: 'invisible',
					...classNames,
				}}
				components={{
					IconLeft: () => <ChevronLeft className="h-4 w-4" />,
					IconRight: () => <ChevronRight className="h-4 w-4" />,
					Caption: CustomCaption,
				}}
				{...props}
			/>
		</div>
	)
}
Calendar.displayName = 'Calendar'

export { Calendar }