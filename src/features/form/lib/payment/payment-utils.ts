import { type FormValues } from '../form-schema'

type Payment = FormValues['payments'][0]

export const calculatePaymentDetails = (
	payments: Payment[],
	totalAmount: number | string | undefined,
	exchangeRate: number | undefined,
) => {
	const totalAmountValue = parseFloat(String(totalAmount)) || 0

	const currentTotalPaid = payments.reduce((acc, payment) => {
		const amount = parseFloat(String(payment.amount)) || 0
		if (!payment.method || !amount) return acc

		const isBolivares = ['Punto de venta', 'Pago móvil', 'Bs en efectivo'].includes(payment.method)

		if (isBolivares) {
			if (exchangeRate && exchangeRate > 0) {
				return acc + amount / exchangeRate
			}
			return acc
		} else {
			return acc + amount
		}
	}, 0)

	let paymentStatus: string | null = null
	let isPaymentComplete = false
	let missingAmount = 0

	if (totalAmountValue > 0) {
		// Redondea total pagado a 2 decimales
		const finalTotalPaid = parseFloat(currentTotalPaid.toFixed(2))
		missingAmount = parseFloat((totalAmountValue - finalTotalPaid).toFixed(2))
		isPaymentComplete = Math.abs(finalTotalPaid - totalAmountValue) < 0.01

		if (isPaymentComplete) {
			paymentStatus = 'Completado'
			missingAmount = 0
		} else if (missingAmount > 0.009) {
			// Si falta menos de 1 centavo, no mostrar nada
			paymentStatus = `Incompleto`
		}
	}

	return { paymentStatus, isPaymentComplete, missingAmount }
}

// NEW: Function to calculate payment details from medical record payment fields
export const calculatePaymentDetailsFromRecord = (
	record: {
		total_amount: number
		payment_method_1?: string | null
		payment_amount_1?: number | null
		payment_method_2?: string | null
		payment_amount_2?: number | null
		payment_method_3?: string | null
		payment_amount_3?: number | null
		payment_method_4?: string | null
		payment_amount_4?: number | null
		exchange_rate?: number | null
	}
) => {
	const totalAmount = record.total_amount || 0
	const exchangeRate = record.exchange_rate || undefined

	// Convert medical record payment fields to payments array format
	const payments = []
	
	for (let i = 1; i <= 4; i++) {
		const method = record[`payment_method_${i}` as keyof typeof record] as string | null
		const amount = record[`payment_amount_${i}` as keyof typeof record] as number | null
		
		if (method && amount && amount > 0) {
			payments.push({
				method,
				amount,
				reference: '' // Reference not needed for calculation
			})
		}
	}

	return calculatePaymentDetails(payments, totalAmount, exchangeRate)
}