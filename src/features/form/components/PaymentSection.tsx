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
import { PaymentHeader } from './payment/PaymentHeader'
import { CurrencyConverter } from './payment/CurrencyConverter'
import { PaymentMethodsList } from './payment/PaymentMethodsList'
import { PaymentSectionSkeleton } from './payment/PaymentSectionSkeleton'
import { calculatePaymentDetails } from '@features/form/lib/payment/payment-utils'
import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'

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
						vesInputValue={vesInputValue}
						setVesInputValue={setVesInputValue}
						usdFromVes={usdFromVes}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
						inputStyles={inputStyles}
					/>
					<div className="space-y-2">
						<FormLabel>Convertidor VES a USD</FormLabel>
						<Input
							type="text"
							inputMode="decimal"
							placeholder="Ingrese monto en Bolívares"
							value={vesInputValue}
							onChange={(e) => {
								const val = e.target.value
								if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
									setVesInputValue(val)
								}
							}}
							className={inputStyles}
						/>
						{usdFromVes && <p className="text-sm font-bold text-green-600">{usdFromVes} USD</p>}
						<p className="text-xs text-muted-foreground">
							{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
						</p>
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