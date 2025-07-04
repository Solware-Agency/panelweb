import { type Control } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { AutocompleteInput } from '@shared/components/ui/autocomplete-input'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/cn'
import { Calendar as CalendarIcon, Loader2, CheckCircle, Cake } from 'lucide-react'
import { format, differenceInYears, differenceInMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@shared/components/ui/calendar'
import { useFormContext, useWatch } from 'react-hook-form'
import { usePatientAutofill } from '@shared/hooks/usePatientAutofill'
import { useState, memo, useCallback, useMemo } from 'react'

interface PatientDataSectionProps {
	control: Control<FormValues>
	inputStyles: string
}

export const PatientDataSection = memo(({ control, inputStyles }: PatientDataSectionProps) => {
	const { setValue } = useFormContext<FormValues>()
	const { fillPatientData, isLoading: isLoadingPatient, lastFilledPatient } = usePatientAutofill(setValue)
	const [isDateOfBirthCalendarOpen, setIsDateOfBirthCalendarOpen] = useState(false)
	const [isRegistrationDateCalendarOpen, setIsRegistrationDateCalendarOpen] = useState(false)

	// Watch date of birth to calculate age
	const dateOfBirth = useWatch({ control, name: 'dateOfBirth' })

	// Calculate age from date of birth - memoized to prevent unnecessary recalculations
	const { currentAge } = useMemo(() => {
		if (!dateOfBirth) return { years: 0, months: 0, currentAge: '' }

		const now = new Date()
		const years = differenceInYears(now, dateOfBirth)
		const months = differenceInMonths(now, dateOfBirth) % 12

		// Format age display based on years and months
		let currentAge = ''
		if (years === 0) {
			currentAge = `${months} ${months === 1 ? 'mes' : 'meses'}`
		} else {
			currentAge = `${years} ${years === 1 ? 'año' : 'años'}`
		}

		return { years, months, currentAge }
	}, [dateOfBirth])

	// Memoize the handler to prevent unnecessary re-renders
	const handlePatientSelect = useCallback(
		(idNumber: string) => {
			fillPatientData(idNumber, true) // Silencioso
		},
		[fillPatientData],
	)

	return (
		<Card className="transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Datos del Paciente
					{isLoadingPatient && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
					{lastFilledPatient && !isLoadingPatient && (
						<div className="flex items-center gap-1 text-green-600 text-sm">
							<CheckCircle className="h-4 w-4" />
							<span>Datos de {lastFilledPatient} cargados</span>
						</div>
					)}
				</CardTitle>
				<div className="w-20 h-1 bg-primary mt-1 rounded-full" />
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Nombre Completo - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre Completo *</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="fullName"
									placeholder="Nombre y Apellido"
									{...field}
									onChange={(e) => {
										const { value } = e.target
										if (/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]*$/.test(value)) {
											field.onChange(e)
										}
									}}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Cédula - CON AUTOCOMPLETADO Y AUTOFILL */}
				<FormField
					control={control}
					name="idNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								Cédula *
								<span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
									Autocompletado inteligente
								</span>
							</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="idNumber"
									placeholder="12345678"
									{...field}
									onPatientSelect={handlePatientSelect}
									onChange={(e) => {
										const { value } = e.target
										if (/^[0-9]*$/.test(value)) {
											field.onChange(e)
										}
									}}
									className={cn(inputStyles, isLoadingPatient && 'border-blue-300')}
								/>
							</FormControl>
							<FormMessage />
							<p className="text-xs text-gray-500 mt-1">
								💡 Haz clic en una cédula para llenar automáticamente los datos del paciente
							</p>
						</FormItem>
					)}
				/>

				{/* Teléfono - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Teléfono *</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="phone"
									placeholder="0412-1234567"
									{...field}
									maxLength={15}
									onChange={(e) => {
										const { value } = e.target
										// Permitir números, guiones, espacios, paréntesis y el símbolo +
										if (/^[0-9-+\s()]*$/.test(value) && value.length <= 15) {
											field.onChange(e)
										}
									}}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Fecha de Nacimiento - CON CALENDARIO */}
				<FormField
					control={control}
					name="dateOfBirth"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="flex items-center gap-2">
								<Cake className="w-4 h-4 text-pink-500" />
								Fecha de Nacimiento *
							</FormLabel>
							<Popover open={isDateOfBirthCalendarOpen} onOpenChange={setIsDateOfBirthCalendarOpen}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={'outline'}
											className={cn(
												'w-full justify-start text-left font-normal',
												!field.value && 'text-muted-foreground',
												inputStyles,
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{field.value ? (
												<div className="flex items-center gap-2">
													<span>{format(field.value, 'PPP', { locale: es })}</span>
													{currentAge && (
														<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
															{currentAge}
														</span>
													)}
												</div>
											) : (
												<span>Selecciona fecha de nacimiento</span>
											)}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={field.value instanceof Date ? field.value : undefined}
										onSelect={(date) => {
											field.onChange(date instanceof Date ? date : null)
											setIsDateOfBirthCalendarOpen(false)
										}}
										disabled={(date) => {
											const today = new Date()
											const maxAge = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate())
											return date < maxAge || false
										}}
										initialFocus
										locale={es}
										defaultMonth={field.value instanceof Date ? field.value : new Date(2000, 0, 1)}
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Email - CON AUTOCOMPLETADO */}
				<FormField
					control={control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Correo electrónico</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="email"
									type="email"
									placeholder="email@ejemplo.com"
									{...field}
									className={inputStyles}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Fecha de Registro - CON CALENDARIO */}
				<FormField
					control={control}
					name="registrationDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Fecha de Registro *</FormLabel>
							<Popover open={isRegistrationDateCalendarOpen} onOpenChange={setIsRegistrationDateCalendarOpen}>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={'outline'}
											className={cn(
												'w-full justify-start text-left font-normal',
												!field.value && 'text-muted-foreground',
												inputStyles,
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{field.value ? (
												format(field.value, 'PPP', { locale: es })
											) : (
												<span>Selecciona fecha de registro</span>
											)}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={field.value instanceof Date ? field.value : undefined}
										onSelect={(date) => {
											field.onChange(date instanceof Date ? date : null)
											setIsRegistrationDateCalendarOpen(false)
										}}
										disabled={(date) => date > new Date()}
										initialFocus
										locale={es}
										defaultMonth={field.value instanceof Date ? field.value : new Date(2000, 0, 1)}
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
})

PatientDataSection.displayName = 'PatientDataSection'