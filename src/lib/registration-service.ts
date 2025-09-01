// =====================================================================
// SERVICIO DE REGISTRO - NUEVA ESTRUCTURA
// =====================================================================
// Servicio principal para registrar casos médicos con la nueva estructura
// Maneja la lógica de buscar/crear pacientes y crear casos médicos

import { findPatientByCedula, createPatient, updatePatient } from './patients-service'
import { createMedicalCase } from './medical-cases-service'
import { supabase } from './supabase/config'

// Tipo de formulario (evita importación circular)
export interface FormValues {
	fullName: string
	idNumber: string
	phone: string
	ageValue: number
	ageUnit: 'AÑOS' | 'MESES'
	email?: string
	examType: string
	doctorName: string
	treatingDoctor: string
	patientType: string
	origin: string
	originType: string
	patientBranch: string
	branch: string
	sampleType: string
	numberOfSamples: number
	relationship?: string
	registrationDate: Date
	totalAmount: number
	payments: Array<{
		method?: string
		amount?: number
		reference?: string
	}>
	comments?: string
}

// Tipo para insertar pacientes (local para evitar problemas de importación)
export interface PatientInsert {
	id?: string
	cedula: string
	nombre: string
	edad?: number | null
	telefono?: string | null
	email?: string | null
	created_at?: string | null
	updated_at?: string | null
	version?: number | null
}

// Tipo para insertar casos médicos (local para evitar problemas de importación)
export interface MedicalCaseInsert {
	id?: string
	patient_id?: string | null
	exam_type: string
	origin: string
	treating_doctor: string
	sample_type: string
	number_of_samples: number
	relationship?: string | null
	branch: string
	date: string
	code?: string
	total_amount: number
	payment_status: string
	status?: string
	comments?: string | null
	generated_by?: string | null
	created_at?: string | null
	updated_at?: string | null
	version?: number | null
}

// Tipos para el resultado del registro
export interface RegistrationResult {
	patient: any | null // Patient type from service
	medicalCase: any | null // MedicalCase type from service
	isNewPatient: boolean
	patientUpdated: boolean
	error?: string
}

// =====================================================================
// FUNCIÓN PRINCIPAL DE REGISTRO
// =====================================================================

/**
 * Registrar un nuevo caso médico con la nueva estructura
 * 1. Busca si el paciente existe por cédula
 * 2. Si no existe, crea nuevo paciente
 * 3. Si existe, verifica si hay cambios en datos del paciente
 * 4. Crea el caso médico enlazado al paciente
 */
export const registerMedicalCase = async (formData: FormValues): Promise<RegistrationResult> => {
	try {
		console.log('🚀 Iniciando registro con nueva estructura...')

		// Obtener información del usuario actual
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) {
			throw new Error('Usuario no autenticado')
		}

		// Preparar datos del paciente y del caso
		const { patientData, caseData } = prepareRegistrationData(formData, user.id)

		// PASO 1: Buscar paciente existente por cédula
		console.log(`🔍 Buscando paciente con cédula: ${patientData.cedula}`)
		let patient = await findPatientByCedula(patientData.cedula)

		let isNewPatient = false
		let patientUpdated = false

		if (!patient) {
			// CASO A: Paciente nuevo - crear registro
			console.log('👤 Paciente no existe, creando nuevo...')
			patient = await createPatient(patientData)
			isNewPatient = true
		} else {
			// CASO B: Paciente existente - verificar si hay cambios
			console.log('👤 Paciente existe, verificando cambios...')
			const hasChanges = detectPatientChanges(patient, patientData)

			if (hasChanges) {
				console.log('📝 Cambios detectados en el paciente, actualizando...')
				patient = await updatePatient(patient.id, patientData, user.id)
				patientUpdated = true
			} else {
				console.log('✅ No hay cambios en los datos del paciente')
			}
		}

		// PASO 2: Crear caso médico enlazado al paciente
		console.log('📋 Creando caso médico...')
		// Remove auto-generated fields before passing to createMedicalCase
		const { created_at, updated_at, ...cleanCaseData } = caseData
		const medicalCase = await createMedicalCase({
			...cleanCaseData,
			patient_id: patient.id,
		})

		console.log('✅ Registro completado exitosamente')

		return {
			patient,
			medicalCase,
			isNewPatient,
			patientUpdated,
		}
	} catch (error) {
		console.error('❌ Error en registro:', error)
		return {
			patient: null,
			medicalCase: null,
			isNewPatient: false,
			patientUpdated: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

// =====================================================================
// FUNCIONES AUXILIARES
// =====================================================================

/**
 * Preparar datos separados para paciente y caso médico
 */
const prepareRegistrationData = (formData: FormValues, userId?: string) => {
	// Datos del paciente (tabla patients)
	const patientData: PatientInsert = {
		cedula: formData.idNumber,
		nombre: formData.fullName,
		edad: formData.ageUnit === 'AÑOS' ? formData.ageValue : null, // Solo guardar edad en años
		telefono: formData.phone,
		email: formData.email || null,
	}

	// Preparar edad para el caso médico (mantener el formato original) - No se usa en nueva estructura
	// const edadFormatted = formData.ageUnit === 'AÑOS' ? `${formData.ageValue}` : `${formData.ageValue} ${formData.ageUnit.toLowerCase()}`

	// Calcular remaining amount
	const totalPayments = formData.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
	const remaining = Math.max(0, formData.totalAmount - totalPayments)

	// Datos del caso médico (tabla medical_records_clean)
	const caseData: MedicalCaseInsert = {
		// Información del examen
		exam_type: formData.examType,
		origin: formData.origin,
		treating_doctor: formData.treatingDoctor || formData.doctorName,
		sample_type: formData.sampleType || '',
		number_of_samples: formData.numberOfSamples || 1,
		relationship: formData.relationship || null,
		branch: formData.branch || formData.patientBranch,
		date: formData.registrationDate.toISOString(),
		code: '', // Se generará automáticamente

		// Información financiera
		total_amount: formData.totalAmount,
		payment_status: remaining > 0 ? 'Pendiente' : 'Pagado',
		status: 'Pendiente',

		// Información adicional
		comments: formData.comments || null,

		// Metadatos
		generated_by: userId || null,
	}

	return { patientData, caseData }
}

/**
 * Detectar si hay cambios en los datos del paciente
 */
const detectPatientChanges = (existingPatient: PatientInsert, newPatientData: PatientInsert): boolean => {
	// Comparar campos principales
	const fields = ['nombre', 'edad', 'telefono', 'email'] as const

	for (const field of fields) {
		const existingValue = existingPatient[field]
		const newValue = newPatientData[field]

		// Normalizar valores para comparación
		const normalizedExisting = existingValue === null ? null : String(existingValue).trim()
		const normalizedNew = newValue === null ? null : String(newValue || '').trim()

		if (normalizedExisting !== normalizedNew) {
			console.log(`Cambio detectado en ${field}: "${normalizedExisting}" → "${normalizedNew}"`)
			return true
		}
	}

	return false
}

// =====================================================================
// FUNCIONES DE BÚSQUEDA Y CONSULTA
// =====================================================================

/**
 * Buscar paciente por cédula para prellenar formulario
 */
export const searchPatientForForm = async (cedula: string) => {
	try {
		const patient = await findPatientByCedula(cedula)

		if (!patient) {
			return null
		}

		// Convertir datos del paciente al formato del formulario
		return {
			fullName: patient.nombre,
			idNumber: patient.cedula,
			phone: patient.telefono || '',
			edad: patient.edad || 0,
			email: patient.email || '',
			// Otros campos se llenan con valores por defecto
			ageValue: patient.edad || 0,
			ageUnit: 'AÑOS' as const,
			
		}
	} catch (error) {
		console.error('Error buscando paciente para formulario:', error)
		return null
	}
}

/**
 * Validar datos antes del registro
 */
export const validateRegistrationData = (formData: FormValues): string[] => {
	const errors: string[] = []

	// Validaciones obligatorias
	if (!formData.idNumber) {
		errors.push('La cédula es obligatoria')
	}

	if (!formData.fullName) {
		errors.push('El nombre completo es obligatorio')
	}

	if (!formData.phone) {
		errors.push('El teléfono es obligatorio')
	}

	if (!formData.examType) {
		errors.push('El tipo de examen es obligatorio')
	}

	if (!formData.treatingDoctor && !formData.doctorName) {
		errors.push('El doctor tratante es obligatorio')
	}

	if (formData.totalAmount <= 0) {
		errors.push('El monto total debe ser mayor a 0')
	}

	// Validar que al menos un método de pago tenga datos si hay montos
	const hasPayments = formData.payments?.some((payment) => (payment.amount || 0) > 0) || false
	const totalPayments = formData.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

	if (hasPayments && totalPayments > formData.totalAmount) {
		errors.push('El total de pagos no puede ser mayor al monto total')
	}

	return errors
}
