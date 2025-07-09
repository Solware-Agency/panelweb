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
import { User, Mail, Phone, CreditCard } from 'lucide-react'

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
			<CardHeader className="p-4 sm:p-6">
				<CardTitle className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl">
					Datos del Paciente
					{isLoadingPatient && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
					{lastFilledPatient && !isLoadingPatient && (
						<div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
							<CheckCircle className="h-4 w-4" />
							<span>Datos de {lastFilledPatient} cargados</span>
						</div>
					)}
				</CardTitle>
			</CardHeader>
			<CardHeader className="p-3 sm:p-4 md:p-6">
				<CardTitle className="text-base sm:text-lg md:text-xl">Datos del Paciente</CardTitle>
				<div className="w-12 sm:w-16 md:w-20 h-1 bg-primary mt-1 rounded-full" />
			</CardHeader>
			<CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
									iconRight={<User className="h-4 w-4 text-muted-foreground" />}
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
								<span className="text-[10px] sm:text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
									Autocompletado inteligente
								</span>
							</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="idNumber"
									placeholder="12345678"
									iconRight={<CreditCard className="h-4 w-4 text-muted-foreground" />}
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
							<p className="text-[10px] sm:text-xs text-gray-500 mt-1">
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
									iconRight={<Phone className="h-4 w-4 text-muted-foreground" />}
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
					className="col-span-1"
					name="dateOfBirth"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="flex items-center gap-2">
								<Cake className="w-4 h-4 text-pink-500" />
								Fecha de Nacimiento *
							</FormLabel>
							<Popover
								open={isDateOfBirthCalendarOpen} 
								onOpenChange={setIsDateOfBirthCalendarOpen}
							>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={'outline'}
											className={cn(
												'w-full justify-start text-left font-normal relative',
												!field.value && 'text-muted-foreground',
												inputStyles,
											)}
										>
											<Calendar className="mr-2 h-4 w-4" />
											{field.value ? (
												<div className="flex items-center gap-2">
													<span>{format(field.value, 'PPP', { locale: es })}</span>
													{currentAge && window.innerWidth >= 640 && (
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
								<PopoverContent className="w-auto p-0 z-[9999]" align="start">
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
					className="col-span-1 sm:col-span-2 lg:col-span-1"
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Correo electrónico</FormLabel>
							<FormControl>
								<AutocompleteInput
									fieldName="email"
									type="email"
									iconRight={<Mail className="h-4 w-4 text-muted-foreground" />}
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
					className="col-span-1"
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
								<PopoverContent className="w-auto p-0" align="start">
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