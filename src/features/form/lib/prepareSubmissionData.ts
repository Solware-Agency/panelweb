import { mapPaymentsToColumns } from '@features/form/lib/payment/payment-mapper'
import { calculatePaymentDetails } from '@features/form/lib/payment/payment-utils'
import { type FormValues } from '@features/form/lib/form-schema'
import type { MedicalRecordInsert } from '@shared/types/types'
import { format } from 'date-fns'

export function prepareSubmissionData(data: FormValues, exchangeRate: number | undefined): MedicalRecordInsert {
	// If total amount is 0, payment is automatically complete
	const totalAmount = data.totalAmount || 0
	const payments = data.payments || []
	
	const { paymentStatus, missingAmount } = totalAmount === 0 
		? { paymentStatus: 'Completado', missingAmount: 0 } 
		: calculatePaymentDetails(payments, totalAmount, exchangeRate)
		
	const paymentsColumns = mapPaymentsToColumns(payments)

	return {
		full_name: data.fullName,
		id_number: data.idNumber,
		phone: data.phone,
		date_of_birth: data.dateOfBirth ? format(data.dateOfBirth as Date, 'yyyy-MM-dd') : '', // Format date for database
		email: data.email,
		exam_type: data.examType,
		origin: data.origin,
		treating_doctor: data.treatingDoctor,
		sample_type: data.sampleType,
		number_of_samples: data.numberOfSamples,
		relationship: data.relationship,
		branch: data.branch,
		date: data.registrationDate instanceof Date ? data.registrationDate.toISOString() : String(data.registrationDate),
		total_amount: totalAmount,
		comments: data.comments,
		exchange_rate: exchangeRate || null,
		payment_status: paymentStatus || 'N/A',
		remaining: paymentStatus === 'Completado' ? 0 : missingAmount,
		...paymentsColumns,
	}
}