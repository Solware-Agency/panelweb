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

export const PaymentMethodsList = ({
	control,
	errors,
	fields,
	append,
	remove,
	inputStyles,
	paymentStatus,
	isPaymentComplete,
}: PaymentMethodsListProps) => (
	<div className="space-y-4">
		<div className="flex justify-between items-center mb-2">
			<FormLabel className="font-semibold">Métodos de Pago</FormLabel>
			{paymentStatus && (
				<div
					className={`text-sm font-bold px-3 py-1 rounded-full transition-all ${
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
			onClick={() => append && append({ method: '', amount: 0, reference: '' })}
			disabled={!append || fields.length >= 4}
			className="disabled:opacity-40"
		>
			<PlusCircle className="mr-2 h-4 w-4" />
			Añadir método de pago
		</Button>
		{fields.length >= 4 && <div className="text-xs text-red-500">No puedes agregar más de 4 métodos de pago.</div>}
	</div>
)