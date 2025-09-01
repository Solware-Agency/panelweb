// =====================================================================
// MAPPERS PARA COMPATIBILIDAD TEMPORAL
// =====================================================================
// Funciones para mapear entre nueva estructura y estructura legacy

import type { MedicalCaseWithPatient } from './medical-cases-service'
import type { MedicalRecord } from '@shared/types/types'

/**
 * Mapea MedicalCaseWithPatient a MedicalRecord para compatibilidad
 */
export const mapToLegacyRecord = (record: MedicalCaseWithPatient): MedicalRecord => {
	return {
		...record,
		// Mapeo de campos nuevos a antiguos
		full_name: record.nombre,
		id_number: record.cedula,
		phone: record.telefono,
		email: record.patient_email,
		edad_display: record.edad ? `${record.edad} años` : undefined,
		// Agregar campos faltantes con valores por defecto
		inmuno: '', // Campo legacy
		inmunohistoquimica: null,
		ims: null,
		googledocs_url: null,
		informepdf_url: null,
		archivo_adjunto_url: null,
		doc_aprobado: null,
		version: record.version || 1,
	} as MedicalRecord
}

/**
 * Mapea un array de MedicalCaseWithPatient a MedicalRecord para compatibilidad
 */
export const mapToLegacyRecords = (records: MedicalCaseWithPatient[]): MedicalRecord[] => {
	return records.map(mapToLegacyRecord)
}
