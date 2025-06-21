import {
	type Control,
	type FieldErrors,
	type FieldArrayWithId,
	type UseFieldArrayAppend,
	type UseFieldArrayRemove,
	useWatch,
} from 'react-hook-form'
import { type FormValues } from '@/lib/form-schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'
import { PaymentHeader } from './payment/PaymentHeader'
import { CurrencyConverter } from './payment/CurrencyConverter'
import { PaymentMethodsList } from './payment/PaymentMethodsList'
import { PaymentSectionSkeleton } from './payment/PaymentSectionSkeleton'
import { calculatePaymentDetails } from '@/lib/payment/payment-utils'

interface PaymentSectionProps {
	control: Control<FormValues>
	errors: FieldErrors<FormValues>
	fields: FieldArrayWithId<FormValues, 'payments', 'id'>[]
	append?: UseFieldArrayAppend<FormValues, 'payments'>
	remove: UseFieldArrayRemove
	inputStyles: string
	usdValue: string
	setUsdValue: (value: string) => void
	vesValue: string
	exchangeRate: number | undefined
	isLoadingRate: boolean
}

export const PaymentSection = ({
	control,
	errors,
	fields,
	append,
	remove,
	inputStyles,
	usdValue,
	setUsdValue,
	vesValue,
	exchangeRate,
	isLoadingRate,
}: PaymentSectionProps) => {
	const watchedPayments = useWatch({
		control,
		name: 'payments',
		defaultValue: [],
	})

	const totalAmount = useWatch({
		control,
		name: 'totalAmount',
	})

	const { paymentStatus, isPaymentComplete, missingAmount } = useMemo(() => {
		return calculatePaymentDetails(watchedPayments, totalAmount, exchangeRate)
	}, [totalAmount, watchedPayments, exchangeRate])

	if (isLoadingRate) {
		return <PaymentSectionSkeleton />
	}

	return (
		<Card className="transition-all duration-300 hover:border-primary hover:-translate-y-1">
			<CardHeader>
				<CardTitle>Pago</CardTitle>
				<div className="w-20 h-1 bg-primary mt-1 rounded-full" />
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<PaymentHeader
						control={control}
						inputStyles={inputStyles}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
					/>
					<CurrencyConverter
						usdValue={usdValue}
						setUsdValue={setUsdValue}
						vesValue={vesValue}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
						inputStyles={inputStyles}
					/>
				</div>

				<PaymentMethodsList
					control={control}
					errors={errors}
					fields={fields}
					append={append}
					remove={remove}
					inputStyles={inputStyles}
					paymentStatus={paymentStatus}
					isPaymentComplete={isPaymentComplete}
					missingAmount={missingAmount}
				/>
			</CardContent>
		</Card>
	)
}
