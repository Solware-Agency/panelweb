// =====================================================================
// SERVICIO DE CASOS MÉDICOS - NUEVA ESTRUCTURA
// =====================================================================
// Servicios para manejar medical_records_clean con referencia a patients

import { supabase } from './supabase/config'
import type { Database } from '@shared/types/types'

// Tipos específicos para casos médicos (simplificados para evitar problemas de importación)
export interface MedicalCase {
	id: string
	patient_id: string | null
	exam_type: string
	origin: string
	treating_doctor: string
	sample_type: string
	number_of_samples: number
	relationship: string | null
	branch: string
	date: string
	code: string | null
	total_amount: number
	payment_status: string
	remaining: number | null
	payment_method_1: string | null
	payment_amount_1: number | null
	payment_reference_1: string | null
	payment_method_2: string | null
	payment_amount_2: number | null
	payment_reference_2: string | null
	payment_method_3: string | null
	payment_amount_3: number | null
	payment_reference_3: string | null
	payment_method_4: string | null
	payment_amount_4: number | null
	payment_reference_4: string | null
	status: string
	comments: string | null
	generated_by: string | null
	created_at: string | null
	updated_at: string | null
	version: number | null
	// Campos adicionales del esquema original para compatibilidad
	log: string | null
	diagnostico: string | null
	inmunohistoquimica: string | null
	ims: string | null
	googledocs_url: string | null
	informepdf_url: string | null
	archivo_adjunto_url: string | null
	doc_aprobado: string | null
}

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
	code?: string | null
	total_amount: number
	payment_status: string
	remaining?: number
	payment_method_1?: string | null
	payment_amount_1?: number | null
	payment_reference_1?: string | null
	payment_method_2?: string | null
	payment_amount_2?: number | null
	payment_reference_2?: string | null
	payment_method_3?: string | null
	payment_amount_3?: number | null
	payment_reference_3?: string | null
	payment_method_4?: string | null
	payment_amount_4?: number | null
	payment_reference_4?: string | null
	status?: string
	comments?: string | null
	generated_by?: string | null
	created_at?: string | null
	updated_at?: string | null
	version?: number | null
}

export interface MedicalCaseUpdate {
	id?: string
	patient_id?: string | null
	exam_type?: string
	origin?: string
	treating_doctor?: string
	sample_type?: string
	number_of_samples?: number
	relationship?: string | null
	branch?: string
	date?: string
	code?: string
	total_amount?: number
	payment_status?: string
	remaining?: number | null
	payment_method_1?: string | null
	payment_amount_1?: number | null
	payment_reference_1?: string | null
	payment_method_2?: string | null
	payment_amount_2?: number | null
	payment_reference_2?: string | null
	payment_method_3?: string | null
	payment_amount_3?: number | null
	payment_reference_3?: string | null
	payment_method_4?: string | null
	payment_amount_4?: number | null
	payment_reference_4?: string | null
	status?: string
	comments?: string | null
	generated_by?: string | null
	created_at?: string | null
	updated_at?: string | null
	version?: number | null
}

// Tipo para casos médicos con información del paciente (usando la vista)
export type MedicalCaseWithPatient = Database['public']['Views']['medical_cases_with_patient']['Row']

// =====================================================================
// FUNCIONES DEL SERVICIO DE CASOS MÉDICOS
// =====================================================================

/**
 * Crear nuevo caso médico
 */
export const createMedicalCase = async (caseData: MedicalCaseInsert): Promise<MedicalCase> => {
	try {
		// Validar que patient_id esté presente
		if (!caseData.patient_id) {
			throw new Error('patient_id es requerido para crear un caso médico')
		}

		const { data, error } = await supabase.from('medical_records_clean').insert(caseData).select().single()

		if (error) {
			throw error
		}

		console.log('✅ Caso médico creado exitosamente:', data)
		return data
	} catch (error) {
		console.error('❌ Error creando caso médico:', error)
		throw error
	}
}

/**
 * Obtener casos médicos por patient_id
 */
export const getCasesByPatientId = async (patientId: string): Promise<MedicalCase[]> => {
	try {
		const { data, error } = await supabase
			.from('medical_records_clean')
			.select('*')
			.eq('patient_id', patientId)
			.order('created_at', { ascending: false })

		if (error) {
			throw error
		}

		return data || []
	} catch (error) {
		console.error('Error obteniendo casos por paciente:', error)
		throw error
	}
}

/**
 * Obtener caso médico por ID
 */
export const getCaseById = async (caseId: string): Promise<MedicalCase | null> => {
	try {
		const { data, error } = await supabase.from('medical_records_clean').select('*').eq('id', caseId).single()

		if (error) {
			if (error.code === 'PGRST116') {
				return null
			}
			throw error
		}

		return data
	} catch (error) {
		console.error('Error obteniendo caso por ID:', error)
		throw error
	}
}

/**
 * Obtener casos médicos con información del paciente (usando vista)
 */
export const getCasesWithPatientInfo = async (
	page = 1,
	limit = 50,
	filters?: {
		searchTerm?: string
		branch?: string
		dateFrom?: string
		dateTo?: string
		examType?: string
		paymentStatus?: string
	},
) => {
	try {
		let query = supabase.from('medical_cases_with_patient').select('*', { count: 'exact' })

		// Aplicar filtros
		if (filters?.searchTerm) {
			query = query.or(
				`nombre.ilike.%${filters.searchTerm}%,cedula.ilike.%${filters.searchTerm}%,code.ilike.%${filters.searchTerm}%`,
			)
		}

		if (filters?.branch) {
			query = query.eq('branch', filters.branch)
		}

		if (filters?.dateFrom) {
			query = query.gte('date', filters.dateFrom)
		}

		if (filters?.dateTo) {
			query = query.lte('date', filters.dateTo)
		}

		if (filters?.examType) {
			query = query.eq('exam_type', filters.examType)
		}

		if (filters?.paymentStatus) {
			query = query.eq('payment_status', filters.paymentStatus)
		}

		// Paginación
		const from = (page - 1) * limit
		const to = from + limit - 1

		const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false })

		if (error) {
			throw error
		}

		return {
			data: data || [],
			count: count || 0,
			page,
			limit,
			totalPages: Math.ceil((count || 0) / limit),
		}
	} catch (error) {
		console.error('Error obteniendo casos con información del paciente:', error)
		throw error
	}
}

/**
 * Actualizar caso médico
 */
export const updateMedicalCase = async (
	caseId: string,
	updates: MedicalCaseUpdate,
	userId?: string,
): Promise<MedicalCase> => {
	try {
		// Obtener datos actuales para detectar cambios
		const currentCase = await getCaseById(caseId)
		if (!currentCase) {
			throw new Error('Caso médico no encontrado')
		}

		// Actualizar caso
		const { data, error } = await supabase
			.from('medical_records_clean')
			.update({
				...updates,
				updated_at: new Date().toISOString(),
			})
			.eq('id', caseId)
			.select()
			.single()

		if (error) {
			throw error
		}

		// Registrar cambios en change_logs si hay userId
		if (userId) {
			await logMedicalCaseChanges(caseId, currentCase, updates, userId)
		}

		console.log('✅ Caso médico actualizado exitosamente:', data)
		return data
	} catch (error) {
		console.error('❌ Error actualizando caso médico:', error)
		throw error
	}
}

/**
 * Registrar cambios de caso médico en change_logs
 */
const logMedicalCaseChanges = async (
	caseId: string,
	oldData: MedicalCase,
	newData: MedicalCaseUpdate,
	userId: string,
) => {
	try {
		// Obtener información del usuario
		const { data: user } = await supabase.auth.getUser()
		const { data: profile } = await supabase.from('profiles').select('display_name, email').eq('id', userId).single()

		const userEmail = profile?.email || user.user?.email || 'unknown'
		const userDisplayName = profile?.display_name || 'Usuario'

		// Crear logs para cada campo que cambió
		const changes = []

		// Mapeo de campos para nombres legibles
		const fieldLabels: Record<string, string> = {
			exam_type: 'Tipo de Examen',
			origin: 'Origen',
			treating_doctor: 'Doctor Tratante',
			sample_type: 'Tipo de Muestra',
			number_of_samples: 'Número de Muestras',
			relationship: 'Parentesco',
			branch: 'Sucursal',
			date: 'Fecha',
			total_amount: 'Monto Total',
			exchange_rate: 'Tasa de Cambio',
			payment_status: 'Estado de Pago',
			remaining: 'Monto Restante',
			comments: 'Comentarios',
			material_remitido: 'Material Remitido',
			informacion_clinica: 'Información Clínica',
			descripcion_macroscopica: 'Descripción Macroscópica',
			diagnostico: 'Diagnóstico',
			comentario: 'Comentario',
		}

		// Detectar cambios
		for (const [field, newValue] of Object.entries(newData)) {
			if (field === 'updated_at') continue

			const oldValue = oldData[field as keyof MedicalCase]

			if (oldValue !== newValue) {
				changes.push({
					medical_record_id: caseId,
					entity_type: 'medical_case',
					field_name: field,
					field_label: fieldLabels[field] || field,
					old_value: String(oldValue || ''),
					new_value: String(newValue || ''),
					user_id: userId,
					user_email: userEmail,
					user_display_name: userDisplayName,
				})
			}
		}

		// Insertar cambios si hay alguno
		if (changes.length > 0) {
			const { error } = await supabase.from('change_logs').insert(changes)

			if (error) {
				console.error('Error registrando cambios del caso médico:', error)
			} else {
				console.log(`✅ ${changes.length} cambios registrados para el caso médico`)
			}
		}
	} catch (error) {
		console.error('Error en logMedicalCaseChanges:', error)
	}
}

/**
 * Buscar casos médicos por código
 */
export const findCaseByCode = async (code: string): Promise<MedicalCaseWithPatient | null> => {
	try {
		const { data, error } = await supabase.from('medical_cases_with_patient').select('*').eq('code', code).single()

		if (error) {
			if (error.code === 'PGRST116') {
				return null
			}
			throw error
		}

		return data
	} catch (error) {
		console.error('Error buscando caso por código:', error)
		throw error
	}
}

/**
 * Obtener estadísticas de casos médicos
 */
export const getMedicalCasesStats = async (filters?: { dateFrom?: string; dateTo?: string; branch?: string }) => {
	try {
		let query = supabase
			.from('medical_cases_with_patient')
			.select('total_amount, payment_status, exam_type, branch, date')

		// Aplicar filtros
		if (filters?.dateFrom) {
			query = query.gte('date', filters.dateFrom)
		}

		if (filters?.dateTo) {
			query = query.lte('date', filters.dateTo)
		}

		if (filters?.branch) {
			query = query.eq('branch', filters.branch)
		}

		const { data, error } = await query

		if (error) {
			throw error
		}

		// Calcular estadísticas
		const stats = {
			totalCases: data?.length || 0,
			totalRevenue: data?.reduce((sum, case_) => sum + (case_.total_amount || 0), 0) || 0,
			paidCases: data?.filter((case_) => case_.payment_status === 'Pagado').length || 0,
			pendingCases: data?.filter((case_) => case_.payment_status === 'Pendiente').length || 0,
			examTypeBreakdown: {} as Record<string, number>,
			branchBreakdown: {} as Record<string, number>,
		}

		// Agrupar por tipo de examen
		data?.forEach((case_) => {
			if (case_.exam_type) {
				stats.examTypeBreakdown[case_.exam_type] = (stats.examTypeBreakdown[case_.exam_type] || 0) + 1
			}
		})

		// Agrupar por sucursal
		data?.forEach((case_) => {
			if (case_.branch) {
				stats.branchBreakdown[case_.branch] = (stats.branchBreakdown[case_.branch] || 0) + 1
			}
		})

		return stats
	} catch (error) {
		console.error('Error obteniendo estadísticas de casos médicos:', error)
		throw error
	}
}

/**
 * Eliminar un caso médico
 */
export const deleteMedicalCase = async (caseId: string): Promise<{ success: boolean; error?: string }> => {
	try {
		if (!caseId) {
			return { success: false, error: 'ID del caso requerido' }
		}

		// Primero verificar que el caso existe
		const { data: existingCase, error: fetchError } = await supabase
			.from('medical_records_clean')
			.select('id, code, patient_id')
			.eq('id', caseId)
			.single()

		if (fetchError) {
			if (fetchError.code === 'PGRST116') {
				return { success: false, error: 'Caso no encontrado' }
			}
			throw fetchError
		}

		// Eliminar el caso médico
		const { error: deleteError } = await supabase.from('medical_records_clean').delete().eq('id', caseId)

		if (deleteError) {
			throw deleteError
		}

		console.log(`✅ Caso médico ${existingCase.code || caseId} eliminado exitosamente`)
		return { success: true }
	} catch (error) {
		console.error('Error eliminando caso médico:', error)
		const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
		return { success: false, error: errorMessage }
	}
}
