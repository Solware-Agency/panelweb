import { type Control, type FieldArrayWithId, type UseFieldArrayRemove, useWatch } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { Button } from '@shared/components/ui/button'
import { Trash2, DollarSign, CreditCard, FileText } from 'lucide-react'
import { isBolivaresMethod } from '@features/form/lib/payment/payment-utils'
import { createCalculatorInputHandlerWithCurrency } from '@shared/utils/number-utils'
import { memo, useMemo, useCallback } from 'react'

interface PaymentMethodItemProps {
	control: Control<FormValues>
	index: number
	item: FieldArrayWithId<FormValues, 'payments', 'id'>
	remove: UseFieldArrayRemove
	inputStyles: string
	fieldsLength: number
	className?: string
}

export const PaymentMethodItem = memo(
	({ control, index, remove, inputStyles, fieldsLength, className }: PaymentMethodItemProps) => {
		const paymentMethod = useWatch({ control, name: `payments.${index}.method` })
		const exchangeRate = undefined // TODO: Obtener tasa de cambio de configuración global

		// Use useMemo to prevent unnecessary recalculations
		const { currencyLabel, currencySymbol } = useMemo(() => {
			const isBolivares = isBolivaresMethod(paymentMethod)
			return {
				isBolivares,
				currencyLabel: isBolivares ? '(Bs)' : '($)',
				currencySymbol: isBolivares ? 'Bs' : '$',
			}
		}, [paymentMethod])

		// Memoize the handler to prevent unnecessary re-renders
		const handleRemove = useCallback(() => remove(index), [remove, index])

		return (
			<div className={className || "grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 items-start bg-secondary p-3 sm:p-4 rounded-lg"}>
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
					render={({ field }) => {
						const calculatorHandler = createCalculatorInputHandlerWithCurrency(
							field.value || 0,
							field.onChange,
							paymentMethod,
							exchangeRate,
						)

						return (
							<FormItem>
								<FormLabel>
									Monto {index + 1} {currencyLabel}
								</FormLabel>
								<FormControl>
									<div className="relative flex flex-col gap-1">
										<div className="relative flex items-center">
											<span className="absolute left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
												{currencySymbol}
											</span>
											<Input
												type="text"
												inputMode="decimal"
												iconLeft={<DollarSign className="h-4 w-4 text-muted-foreground" />}
												placeholder={calculatorHandler.placeholder}
												value={calculatorHandler.displayValue}
												onKeyDown={calculatorHandler.handleKeyDown}
												onPaste={calculatorHandler.handlePaste}
												onFocus={calculatorHandler.handleFocus}
												onChange={calculatorHandler.handleChange}
												className={`${inputStyles} pl-9 text-right font-mono`}
												autoComplete="off"
											/>
										</div>
										{calculatorHandler.conversionText && (
											<p className="text-xs text-green-600 dark:text-green-400 text-right">
												{calculatorHandler.conversionText}
											</p>
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)
					}}
				/>
				<FormField
					control={control}
					name={`payments.${index}.reference`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Referencia {index + 1}</FormLabel>
							<FormControl>
								<Input 
									placeholder="Referencia de pago" 
									{...field} 
									className={inputStyles} 
									iconRight={<FileText className="h-4 w-4 text-muted-foreground" />}
								/>
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
						onClick={handleRemove}
						aria-label="Eliminar método de pago"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</div>
		)
	},
)

PaymentMethodItem.displayName = 'PaymentMethodItem'