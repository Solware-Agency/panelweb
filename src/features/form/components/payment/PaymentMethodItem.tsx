import { type Control, type FieldArrayWithId, type UseFieldArrayRemove, useWatch } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Button } from '@shared/components/ui/button'
import { Trash2 } from 'lucide-react'

interface PaymentMethodItemProps {
	control: Control<FormValues>
	index: number
	item: FieldArrayWithId<FormValues, 'payments', 'id'>
	remove: UseFieldArrayRemove
	inputStyles: string
	fieldsLength: number
}

export const PaymentMethodItem = ({ control, index, remove, inputStyles, fieldsLength }: PaymentMethodItemProps) => {
	const paymentMethod = useWatch({ control, name: `payments.${index}.method` })
	const isBolivares = ['Punto de venta', 'Pago móvil', 'Bs en efectivo'].includes(paymentMethod || '')
	const currencyLabel = isBolivares ? '(Bs)' : '($)'
	const currencySymbol = isBolivares ? 'Bs' : '$'

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start bg-secondary p-4 rounded-lg">
			<FormField
				control={control}
				name={`payments.${index}.method`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Forma de Pago {index + 1}</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger className={inputStyles}>
									<SelectValue placeholder="Seleccione una opción" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="Punto de venta">Punto de venta</SelectItem>
								<SelectItem value="Dólares en efectivo">Dólares en efectivo</SelectItem>
								<SelectItem value="Zelle">Zelle</SelectItem>
								<SelectItem value="Pago móvil">Pago móvil</SelectItem>
								<SelectItem value="Bs en efectivo">Bs en efectivo</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`payments.${index}.amount`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Monto {index + 1} {currencyLabel}
						</FormLabel>
						<FormControl>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
									{currencySymbol}
								</span>
								<Input 
									type="number" 
									step="0.01" 
									placeholder="0" 
									{...field}
									value={field.value === 0 ? '' : field.value}
									onChange={(e) => {
										const value = e.target.value
										field.onChange(value === '' ? 0 : Number(value))
									}}
									className={`${inputStyles} pl-9`} 
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name={`payments.${index}.reference`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Referencia {index + 1}</FormLabel>
						<FormControl>
							<Input placeholder="Referencia de pago" {...field} className={inputStyles} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{fieldsLength > 1 && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="text-destructive mt-8"
					onClick={() => remove(index)}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	)
}