import { supabase } from '@lib/supabase/config'

export type DocAprobadoStatus = 'faltante' | 'pendiente' | 'aprobado'

export async function markCaseAsPending(caseId: string) {
	return supabase
		.from('medical_records_clean')
		.update({ doc_aprobado: 'pendiente' as DocAprobadoStatus, updated_at: new Date().toISOString() })
		.eq('id', caseId)
		.select('id, doc_aprobado')
		.single()
}

export async function approveCaseDocument(caseId: string) {
	return supabase
		.from('medical_records_clean')
		.update({ doc_aprobado: 'aprobado' as DocAprobadoStatus, updated_at: new Date().toISOString() })
		.eq('id', caseId)
		.select('id, doc_aprobado')
		.single()
}
