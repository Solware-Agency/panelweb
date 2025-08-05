import {
	type Control,
	type FieldArrayWithId,
	type UseFieldArrayAppend,
	type UseFieldArrayRemove,
	useWatch,
} from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { useMemo, memo } from 'react'
import { PaymentHeader } from './payment/PaymentHeader'
import { ConverterUSDtoVES } from './payment/ConverterUSDtoVES'
import { PaymentMethodsList } from './payment/PaymentMethodsList'
import { PaymentSectionSkeleton } from './payment/PaymentSectionSkeleton'
import { calculatePaymentDetails } from '@features/form/lib/payment/payment-utils'

interface PaymentSectionProps {
	control: Control<FormValues>
	fields: FieldArrayWithId<FormValues, 'payments', 'id'>[]
	append?: UseFieldArrayAppend<FormValues, 'payments'> | (() => void)
	remove: UseFieldArrayRemove
	inputStyles: string
	usdValue: string
	setUsdValue: (value: string) => void
	vesValue: string
	vesInputValue: string
	setVesInputValue: (value: string) => void
	usdFromVes: string
	exchangeRate: number | undefined
	isLoadingRate: boolean
}

export const PaymentSection = memo(({
	control,
	fields,
	append,
	remove,
	inputStyles,
	usdValue,
	setUsdValue,
	vesValue,
	vesInputValue,
	setVesInputValue,
	usdFromVes,
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

	// Use useMemo to prevent recalculation on every render
	const { paymentStatus, isPaymentComplete, missingAmount } = useMemo(() => {
		return calculatePaymentDetails(watchedPayments, totalAmount, exchangeRate)
	}, [totalAmount, watchedPayments, exchangeRate])

	if (isLoadingRate) {
		return <PaymentSectionSkeleton />
	}

	return (
		<Card className="transition-transform duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
			<CardHeader className="p-4 sm:p-6">
				<CardTitle className="text-lg sm:text-xl">Pago</CardTitle>
			</CardHeader>
			<CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
					<PaymentHeader
						control={control}
						inputStyles={inputStyles}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
					/>
					<ConverterUSDtoVES
						usdValue={usdValue}
						setUsdValue={setUsdValue}
						vesValue={vesValue}
						vesInputValue={vesInputValue}
						setVesInputValue={setVesInputValue}
						usdFromVes={usdFromVes}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
						inputStyles={inputStyles}
					/>
				</div>

				<PaymentMethodsList
					control={control}
					fields={fields}
					append={append}
					remove={remove}
					inputStyles={inputStyles}
					paymentStatus={paymentStatus}
					isPaymentComplete={isPaymentComplete}
					missingAmount={missingAmount}
					exchangeRate={exchangeRate}
				/>
			</CardContent>
		</Card>
	)
})

PaymentSection.displayName = 'PaymentSection'