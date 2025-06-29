import { type Control } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { AutocompleteInput } from '@shared/components/ui/autocomplete-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'

interface ServiceSectionProps {
	control: Control<FormValues>
	inputStyles: string
}

export const ServiceSection = ({ control, inputStyles }: ServiceSectionProps) => (
	<Card className="transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
		<CardHeader>
			<CardTitle>Servicio</CardTitle>
			<div className="w-20 h-1 bg-primary mt-1 rounded-full" />
		</CardHeader>
		<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{/* Tipo de Examen - SIN AUTOCOMPLETADO (es un select) */}
			<FormField
				control={control}
				name="examType"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tipo de Examen *</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger className={inputStyles}>
									<SelectValue placeholder="Seleccione una opción" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="inmunohistoquimica">Inmunohistoquímica</SelectItem>
								<SelectItem value="biopsia">Biopsia</SelectItem>
								<SelectItem value="citologia">Citología</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Procedencia - CON AUTOCOMPLETADO */}
			<FormField
				control={control}
				name="origin"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Procedencia *</FormLabel>
						<FormControl>
							<AutocompleteInput
								fieldName="origin"
								placeholder="Hospital o Clínica"
								{...field}
								onChange={(e: any) => {
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

			{/* Médico Tratante - CON AUTOCOMPLETADO */}
			<FormField
				control={control}
				name="treatingDoctor"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Médico Tratante *</FormLabel>
						<FormControl>
							<AutocompleteInput
								fieldName="treatingDoctor"
								placeholder="Nombre del Médico"
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

			{/* Tipo de Muestra - CON AUTOCOMPLETADO */}
			<FormField
				control={control}
				name="sampleType"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tipo de Muestra *</FormLabel>
						<FormControl>
							<AutocompleteInput
								fieldName="sampleType"
								placeholder="Ej: Biopsia de Piel"
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

			{/* Cantidad de Muestras - SIN AUTOCOMPLETADO (es numérico) - PLACEHOLDER ACTUALIZADO */}
			<FormField
				control={control}
				name="numberOfSamples"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Cantidad de Muestras *</FormLabel>
						<FormControl>
							<Input type="number" placeholder="0" {...field} className={inputStyles} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Relación - CON AUTOCOMPLETADO */}
			<FormField
				control={control}
				name="relationship"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Relación</FormLabel>
						<FormControl>
							<AutocompleteInput
								fieldName="relationship"
								placeholder="Relación con la muestra"
								{...field}
								className={inputStyles}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</CardContent>
	</Card>
)