import { type FormValues } from '../form-schema'

// --- Helper: Map payments array to flat columns for Supabase ---
export const mapPaymentsToColumns = (payments: FormValues['payments']) => {
	// Siempre crea hasta 4 pares, rellenando null si no hay tantos métodos
	const columns: Record<string, string | number | null> = {}
	for (let i = 0; i < 4; i++) {
		const payment = payments[i]
		columns[`payment_method_${i + 1}`] = payment?.method || null
		columns[`payment_amount_${i + 1}`] = payment?.amount ?? null
		columns[`payment_reference_${i + 1}`] = payment?.reference || null
	}
	return columns
}
