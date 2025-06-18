import { supabase } from "@/integrations/supabase/client";
import { type FormValues } from "./form-schema";
import { prepareSubmissionData } from "./prepareSubmissionData";
import type { MedicalRecordInsert } from '@/integrations/supabase/types'

export interface MedicalRecord {
	id?: string
	full_name: string
	id_number: string
	phone: string
	age: number
	email?: string | null
	date: string
	exam_type: string
	origin: string
	treating_doctor: string
	sample_type: string
	number_of_samples: number
	relationship?: string | null
	branch: string
	total_amount: number
	exchange_rate?: number | null
	payment_status: string
	remaining: number
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
	comments?: string | null
	created_at?: string
	updated_at?: string
}

// Nombre de la tabla nueva y limpia
const TABLE_NAME = 'medical_records_clean'

export const testConnection = async () => {
	try {
		console.log(`🔍 Probando conexión con Supabase (tabla ${TABLE_NAME})...`)

		const { data, error } = await supabase.from(TABLE_NAME).select('count', { count: 'exact', head: true })

		if (error) {
			console.error('❌ Error en test de conexión:', error)
			return { success: false, error }
		}

		console.log(`✅ Test de conexión exitoso con tabla ${TABLE_NAME}`)
		return { success: true, data }
	} catch (error) {
		console.error('❌ Error inesperado en test de conexión:', error)
		return { success: false, error }
	}
}

export const insertMedicalRecord = async (
	formData: FormValues,
	exchangeRate?: number,
): Promise<{ data: MedicalRecord | null; error: any }> => {
	try {
		console.log(`🚀 Iniciando inserción en tabla ${TABLE_NAME}...`)

		// Primero probamos la conexión
		const connectionTest = await testConnection()
		if (!connectionTest.success) {
			console.error('❌ Fallo en test de conexión:', connectionTest.error)
			return {
				data: null,
				error: {
					message: 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.',
					code: 'CONNECTION_FAILED',
					details: connectionTest.error,
				},
			}
		}

		const submissionData = prepareSubmissionData(formData, exchangeRate)
		console.log(`📋 Datos preparados para ${TABLE_NAME}:`, submissionData)

		// Convertir los datos preparados para que coincidan con el esquema de la base de datos
		const recordData: MedicalRecordInsert = {
			full_name: submissionData.full_name,
			id_number: submissionData.id_number,
			phone: submissionData.phone,
			age: Number(submissionData.age),
			email: submissionData.email || undefined,
			date: submissionData.date,
			exam_type: submissionData.exam_type,
			origin: submissionData.origin,
			treating_doctor: submissionData.treating_doctor,
			sample_type: submissionData.sample_type,
			number_of_samples: submissionData.number_of_samples,
			relationship: submissionData.relationship || undefined,
			branch: submissionData.branch,
			total_amount: submissionData.total_amount,
			exchange_rate: submissionData.exchange_rate || undefined,
			payment_status: submissionData.payment_status,
			remaining: submissionData.remaining,
			payment_method_1: submissionData.payment_method_1,
			payment_amount_1: submissionData.payment_amount_1,
			payment_reference_1: submissionData.payment_reference_1,
			payment_method_2: submissionData.payment_method_2,
			payment_amount_2: submissionData.payment_amount_2,
			payment_reference_2: submissionData.payment_reference_2,
			payment_method_3: submissionData.payment_method_3,
			payment_amount_3: submissionData.payment_amount_3,
			payment_reference_3: submissionData.payment_reference_3,
			payment_method_4: submissionData.payment_method_4,
			payment_amount_4: submissionData.payment_amount_4,
			payment_reference_4: submissionData.payment_reference_4,
			comments: submissionData.comments || undefined,
		}

		console.log(`💾 Insertando datos en tabla ${TABLE_NAME}:`, recordData)

		const { data, error } = await supabase.from(TABLE_NAME).insert([recordData]).select().single()

		if (error) {
			console.error(`❌ Error insertando en ${TABLE_NAME}:`, error)

			// Manejo específico de errores
			if (error.code === 'PGRST116') {
				return {
					data: null,
					error: {
						message: `La tabla ${TABLE_NAME} no existe. Ejecuta la migración create_medical_records_clean.sql`,
						code: 'TABLE_NOT_EXISTS',
						details: error,
					},
				}
			}

			if (error.code === '42P01') {
				return {
					data: null,
					error: {
						message: `Error de base de datos: tabla ${TABLE_NAME} no encontrada.`,
						code: 'TABLE_NOT_FOUND',
						details: error,
					},
				}
			}

			if (error.code === '23514') {
				return {
					data: null,
					error: {
						message: 'Error de validación: verifica que todos los campos cumplan las restricciones.',
						code: 'VALIDATION_ERROR',
						details: error,
					},
				}
			}

			return { data: null, error }
		}
		console.log(`✅ Registro médico insertado exitosamente en ${TABLE_NAME}:`, data)
		return { data: data as MedicalRecord, error: null }
	} catch (error) {
		console.error(`❌ Error inesperado insertando en ${TABLE_NAME}:`, error)

		// Si es un error de red
		if (error instanceof TypeError && String(error).includes('fetch')) {
			return {
				data: null,
				error: {
					message: 'Error de conexión de red. Verifica tu conexión a internet.',
					code: 'NETWORK_ERROR',
					details: error,
				},
			}
		}

		return { data: null, error }
	}
}

export const getMedicalRecords = async (limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  } catch (error) {
    console.error(`Error fetching ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

export const getMedicalRecordById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    console.error(`Error fetching record from ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

export const searchMedicalRecords = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error(`Error searching ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error(`Error updating record in ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

export const deleteMedicalRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error(`Error deleting record from ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

// Función para obtener estadísticas
export const getMedicalRecordsStats = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('total_amount, payment_status, created_at');

    if (error) return { data: null, error };

    const stats = {
      total: data.length,
      totalAmount: data.reduce((sum, record) => sum + record.total_amount, 0),
      completed: data.filter(record => record.payment_status === 'Completado').length,
      pending: data.filter(record => record.payment_status === 'Pendiente').length,
      incomplete: data.filter(record => record.payment_status.includes('Incompleto')).length,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error(`Error getting stats from ${TABLE_NAME}:`, error);
    return { data: null, error };
  }
};

// Mantener compatibilidad con nombres anteriores
export const insertCliente = insertMedicalRecord;
export const getClientes = getMedicalRecords;
export const getClienteById = getMedicalRecordById;
export const searchClientes = searchMedicalRecords;
export type Cliente = MedicalRecord;