import { mapPaymentsToColumns } from '@/lib/payment/payment-mapper'
import { calculatePaymentDetails } from '@/lib/payment/payment-utils'
import { type FormValues } from './form-schema'
import type { MedicalRecordInsert } from '@/types/types'

export function prepareSubmissionData(data: FormValues, exchangeRate: number | undefined): MedicalRecordInsert {
	const { paymentStatus, missingAmount } = calculatePaymentDetails(data.payments, data.totalAmount, exchangeRate)
	const paymentsColumns = mapPaymentsToColumns(data.payments)

	return {
		full_name: data.fullName,
		id_number: data.idNumber,
		phone: data.phone,
		age: data.age,
		email: data.email,
		exam_type: data.examType,
		origin: data.origin,
		treating_doctor: data.treatingDoctor,
		sample_type: data.sampleType,
		number_of_samples: data.numberOfSamples,
		relationship: data.relationship,
		branch: data.branch,
		date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
		total_amount: data.totalAmount,
		comments: data.comments,
		exchange_rate: exchangeRate || null,
		payment_status: paymentStatus || 'N/A',
		remaining: paymentStatus === 'Completado' ? 0 : missingAmount,
		...paymentsColumns,
	}
}
