import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { CustomDropdown } from '@shared/components/ui/custom-dropdown'
import {
	Popover as DatePopover,
	PopoverContent as DatePopoverContent,
	PopoverTrigger as DatePopoverTrigger,
} from '@shared/components/ui/popover'
import { Calendar as CalendarComponent } from '@shared/components/ui/calendar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Filter, Stethoscope, FileText, Calendar as CalendarIcon, X } from 'lucide-react'
import DoctorFilterPanel from './DoctorFilterPanel'
import type { MedicalCaseWithPatient } from '@lib/medical-cases-service'

interface FiltersModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	// Filtros actuales
	statusFilter: string
	onStatusFilterChange: (value: string) => void
	branchFilter: string
	onBranchFilterChange: (value: string) => void
	startDate: Date | undefined
	onStartDateChange: (date: Date | undefined) => void
	showPdfReadyOnly: boolean
	onPdfFilterToggle: () => void
	selectedDoctors: string[]
	onDoctorFilterChange: (doctors: string[]) => void
	// Opciones para los dropdowns
	statusOptions: Array<{ value: string; label: string }>
	branchOptions: Array<{ value: string; label: string }>
	// Datos para el filtro de doctores
	cases: MedicalCaseWithPatient[]
	// Callbacks
	onApplyFilters: () => void
	onClearAllFilters: () => void
}

const FiltersModal: React.FC<FiltersModalProps> = ({
	isOpen,
	onOpenChange,
	statusFilter,
	onStatusFilterChange,
	branchFilter,
	onBranchFilterChange,
	startDate,
	onStartDateChange,
	showPdfReadyOnly,
	onPdfFilterToggle,
	selectedDoctors,
	onDoctorFilterChange,
	statusOptions,
	branchOptions,
	cases,
	onApplyFilters,
	onClearAllFilters,
}) => {
	const [isStartOpen, setIsStartOpen] = useState(false)
	const [showDoctorFilter, setShowDoctorFilter] = useState(false)

	// Check if there are any active filters
	const hasActiveFilters =
		statusFilter !== 'all' || branchFilter !== 'all' || showPdfReadyOnly || selectedDoctors.length > 0 || startDate

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant={hasActiveFilters ? 'default' : 'outline'}
					className="flex items-center gap-2"
					title="Filtros avanzados"
				>
					<Filter className="w-4 h-4" />
					<span>Filtros</span>
					{hasActiveFilters && (
						<span className="bg-white dark:bg-gray-800 text-primary text-xs px-2 py-0.5 rounded-full">
							{[
								statusFilter !== 'all' ? 1 : 0,
								branchFilter !== 'all' ? 1 : 0,
								showPdfReadyOnly ? 1 : 0,
								selectedDoctors.length,
								startDate ? 1 : 0,
							].reduce((a, b) => a + b, 0)}
						</span>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filtros Avanzados
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Status and Branch Filters */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<h3 className="text-lg font-medium">Estado de Pago</h3>
							<CustomDropdown
								options={statusOptions}
								value={statusFilter}
								placeholder="Seleccionar estado"
								onChange={onStatusFilterChange}
								data-testid="status-filter"
							/>
						</div>

						<div className="space-y-3">
							<h3 className="text-lg font-medium">Sede</h3>
							<CustomDropdown
								options={branchOptions}
								value={branchFilter}
								placeholder="Seleccionar sede"
								onChange={onBranchFilterChange}
								data-testid="branch-filter"
							/>
						</div>
					</div>

					{/* Date Filter */}
					<div className="space-y-3">
						<h3 className="text-lg font-medium flex items-center gap-2">
							<CalendarIcon className="w-4 h-4" />
							Fecha de Registro
						</h3>
						<div className="flex items-center gap-2">
							<DatePopover open={isStartOpen} onOpenChange={setIsStartOpen}>
								<DatePopoverTrigger asChild>
									<Button variant="outline" className="flex items-center gap-2">
										<CalendarIcon className="w-4 h-4" />
										{startDate ? format(startDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
									</Button>
								</DatePopoverTrigger>
								<DatePopoverContent className="w-auto p-0">
									<CalendarComponent
										mode="single"
										selected={startDate}
										onSelect={(date) => {
											onStartDateChange(date || undefined)
											setIsStartOpen(false)
										}}
										initialFocus
										locale={es}
										toDate={new Date()}
										disabled={{ after: new Date() }}
									/>
								</DatePopoverContent>
							</DatePopover>

							{startDate && (
								<Button
									onClick={() => onStartDateChange(undefined)}
									variant="ghost"
									size="sm"
									className="text-xs px-2 py-1"
									title="Limpiar fecha"
								>
									<X className="w-4 h-4" />
								</Button>
							)}
						</div>
					</div>

					{/* Doctor Filter */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium flex items-center gap-2">
								<Stethoscope className="w-4 h-4" />
								Filtrar por Médico
							</h3>
							<Button
								onClick={() => setShowDoctorFilter(!showDoctorFilter)}
								variant={showDoctorFilter ? 'default' : 'outline'}
								size="sm"
							>
								{showDoctorFilter ? 'Ocultar' : 'Mostrar'} Filtros
							</Button>
						</div>

						{showDoctorFilter && (
							<div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
								<DoctorFilterPanel cases={cases as any} onFilterChange={onDoctorFilterChange} />
							</div>
						)}

						{selectedDoctors.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{selectedDoctors.map((doctor) => (
									<span
										key={doctor}
										className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
									>
										{doctor}
										<button
											onClick={() => onDoctorFilterChange(selectedDoctors.filter((d) => d !== doctor))}
											className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* PDF Ready Filter */}
					<div className="space-y-3">
						<h3 className="text-lg font-medium flex items-center gap-2">
							<FileText className="w-4 h-4" />
							PDF Disponibles
						</h3>
						<Button
							onClick={onPdfFilterToggle}
							variant={showPdfReadyOnly ? 'default' : 'outline'}
							className="w-full justify-start"
						>
							<FileText className="w-4 h-4 mr-2" />
							{showPdfReadyOnly ? 'Mostrando solo PDF disponibles' : 'Mostrar solo PDF disponibles'}
						</Button>
					</div>

					{/* Active Filters Summary */}
					{hasActiveFilters && (
						<div className="space-y-3">
							<h3 className="text-lg font-medium">Filtros Activos</h3>
							<div className="flex flex-wrap gap-2">
								{statusFilter !== 'all' && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
										Estado: {statusFilter}
										<button
											onClick={() => onStatusFilterChange('all')}
											className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								)}

								{branchFilter !== 'all' && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
										Sede: {branchFilter}
										<button
											onClick={() => onBranchFilterChange('all')}
											className="ml-1 hover:text-green-600 dark:hover:text-green-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								)}

								{startDate && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full">
										Fecha: {format(startDate, 'dd/MM/yyyy')}
										<button
											onClick={() => onStartDateChange(undefined)}
											className="ml-1 hover:text-purple-600 dark:hover:text-purple-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								)}

								{showPdfReadyOnly && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm rounded-full">
										PDF Disponibles
										<button
											onClick={onPdfFilterToggle}
											className="ml-1 hover:text-orange-600 dark:hover:text-orange-200"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								)}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex justify-between pt-4 border-t">
						<Button onClick={onClearAllFilters} variant="outline" disabled={!hasActiveFilters}>
							<X className="w-4 h-4 mr-2" />
							Limpiar Todos los Filtros
						</Button>

						<Button
							onClick={() => {
								onApplyFilters()
								onOpenChange(false)
							}}
							className="px-6"
						>
							Aplicar Filtros
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default FiltersModal
