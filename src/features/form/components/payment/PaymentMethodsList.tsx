import {
	type Control,
	type FieldErrors,
	type FieldArrayWithId,
	type UseFieldArrayAppend,
	type UseFieldArrayRemove,
} from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormLabel, FormMessage } from '@shared/components/ui/form'
import { Button } from '@shared/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { PaymentMethodItem } from './PaymentMethodItem'
import { memo, useCallback } from 'react'

interface PaymentMethodsListProps {
	control: Control<FormValues>
	errors: FieldErrors<FormValues>
	fields: FieldArrayWithId<FormValues, 'payments', 'id'>[]
	append?: UseFieldArrayAppend<FormValues, 'payments'>
	remove: UseFieldArrayRemove
	inputStyles: string
	paymentStatus: string | null
	isPaymentComplete: boolean
	missingAmount?: number
}

export const PaymentMethodsList = memo(({
	control,
	errors,
	fields,
	append,
	remove,
	inputStyles,
	paymentStatus,
	isPaymentComplete,
}: PaymentMethodsListProps) => {
	// Memoize the append handler to prevent unnecessary re-renders
	const handleAppend = useCallback(() => {
		if (append) {
			append({ method: '', amount: 0, reference: '' })
		}
	}, [append])

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center mb-2">
				<FormLabel className="font-semibold text-sm sm:text-base">Métodos de Pago</FormLabel>
				{paymentStatus && (
					<div
						className={`text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-all ${
							isPaymentComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
						}`}
					>
						Pago: {paymentStatus}
					</div>
				)}
			</div>
			{fields.map((item, index) => (
				<PaymentMethodItem
					key={item.id}
					control={control}
					index={index}
					item={item}
					remove={remove}
					inputStyles={inputStyles}
					fieldsLength={fields.length}
				/>
			))}
			<FormMessage>{errors.payments?.message}</FormMessage>
			<Button
				type="button"
				variant="outline"
				size="sm" 
				onClick={handleAppend}
				disabled={!append || fields.length >= 4}
				className="disabled:opacity-40 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
			>
				<PlusCircle className="mr-2 h-4 w-4" />
				Añadir método de pago
			</Button>
			{fields.length >= 4 && <div className="text-[10px] sm:text-xs text-red-500">No puedes agregar más de 4 métodos de pago.</div>}
		</div>
	)
})

PaymentMethodsList.displayName = 'PaymentMethodsList'