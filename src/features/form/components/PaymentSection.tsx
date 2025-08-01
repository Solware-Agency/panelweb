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

				<div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
					<div className="flex-1">
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
					</div>

					{/* Panel de estado de pago */}
					<div className="lg:w-80 flex-shrink-0">
						{/* Alerta de monto pendiente */}
						{!isPaymentComplete && missingAmount > 0 && (
							<div className="bg-red-900/70 text-red-200 border border-red-700 rounded-lg px-4 py-3 mb-4 text-sm font-semibold">
								<div>
									<span className="mr-2">⚠️</span>
									Monto pendiente: ${missingAmount.toFixed(2)}
								</div>
								{exchangeRate && (
									<div className="mt-1 text-xs text-red-300 font-normal">
										Equivalente: Bs {(missingAmount * exchangeRate).toFixed(2)}
									</div>
								)}
							</div>
						)}

						{/* Mensaje de pago completado */}
						{isPaymentComplete && (
							<div className="bg-green-900/70 text-green-200 border border-green-700 rounded-lg px-4 py-3 mb-4 text-sm font-semibold">
								<div>
									<span className="mr-2">✅</span>
									Pago completado
								</div>
								<div className="mt-1 text-xs text-green-300 font-normal">
									El monto total ha sido cubierto
								</div>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
})

PaymentSection.displayName = 'PaymentSection'