import {
	type Control,
	type FieldErrors,
	type FieldArrayWithId,
	type UseFieldArrayAppend,
	type UseFieldArrayRemove,
	useWatch,
} from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { useMemo } from 'react'
import { PaymentHeader } from './PaymentHeader'
import { CurrencyConverter } from './CurrencyConverter'
import { PaymentMethodsList } from './PaymentMethodsList'
import { PaymentSectionSkeleton } from './PaymentSectionSkeleton'
import { calculatePaymentDetails } from '@features/form/lib/payment/payment-utils'
import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'
import { DollarSign } from 'lucide-react'

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
	vesInputValue: string
	setVesInputValue: (value: string) => void
	usdFromVes: string
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

	const { paymentStatus, isPaymentComplete, missingAmount } = useMemo(() => {
		return calculatePaymentDetails(watchedPayments, totalAmount, exchangeRate)
	}, [totalAmount, watchedPayments, exchangeRate])

	if (isLoadingRate) {
		return <PaymentSectionSkeleton />
	}

	return (
		<Card className="transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
			<CardHeader className="p-3 sm:p-4">
				<CardTitle className="text-base sm:text-lg flex items-center">Pago</CardTitle>
				<div className="w-12 sm:w-16 md:w-20 h-1 bg-primary mt-1 rounded-full" />
			</CardHeader>
			<CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
					<PaymentHeader
						control={control}
						inputStyles={inputStyles}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
					/>
					<div className="flex flex-col sm:flex-row gap-2 sm:col-span-1 lg:col-span-2">
						<CurrencyConverter
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