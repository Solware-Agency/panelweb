export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
	public: {
		Tables: {
			a_usuarios: {
				Row: {
					automatizaciones_sugeridas: string[] | null
					historial: unknown | null
					nombre_cliente: string | null
					tipo_negocio: string | null
					user_id: string
				}
				Insert: {
					automatizaciones_sugeridas?: string[] | null
					historial: unknown | null
					nombre_cliente?: string | null
					tipo_negocio?: string | null
					user_id: string
				}
				Update: {
					automatizaciones_sugeridas?: string[] | null
					historial: unknown | null
					nombre_cliente?: string | null
					tipo_negocio?: string | null
					user_id?: string
				}
				Relationships: []
			}
			contact_submissions: {
				Row: {
					areas: string[] | null
					company: string | null
					created_at: string | null
					email: string
					id: string
					message: string
					name: string
					phone: string | null
					sector: string | null
				}
				Insert: {
					areas?: string[] | null
					company?: string | null
					created_at?: string | null
					email: string
					id?: string
					message: string
					name: string
					phone?: string | null
					sector?: string | null
				}
				Update: {
					areas?: string[] | null
					company?: string | null
					created_at?: string | null
					email?: string
					id?: string
					message?: string
					name?: string
					phone?: string | null
					sector?: string | null
				}
				Relationships: []
			}
			GTR: {
				Row: {
					created_at: string
					id: number
					nombre: string | null
				}
				Insert: {
					created_at?: string
					id?: number
					nombre?: string | null
				}
				Update: {
					created_at?: string
					id?: number
					nombre?: string | null
				}
				Relationships: []
			}
			json: {
				Row: {
					Categoria: string | null
					Comentario: string | null
					Ejemplo: string | null
					ID: string
					Nodos: string | null
					Nombre: string | null
					Price: string | null
					Score: number | null
					Solucion: string | null
					Tipo: string | null
				}
				Insert: {
					Categoria?: string | null
					Comentario?: string | null
					Ejemplo?: string | null
					ID: string
					Nodos?: string | null
					Nombre?: string | null
					Price?: string | null
					Score?: number | null
					Solucion?: string | null
					Tipo?: string | null
				}
				Update: {
					Categoria?: string | null
					Comentario?: string | null
					Ejemplo?: string | null
					ID?: string
					Nodos?: string | null
					Nombre?: string | null
					Price?: string | null
					Score?: number | null
					Solucion?: string | null
					Tipo?: string | null
				}
				Relationships: []
			}
			patients: {
				Row: {
					id: string
					cedula: string
					nombre: string
					edad: number | null
					telefono: string | null
					email: string | null
					created_at: string | null
					updated_at: string | null
					version: number | null
				}
				Insert: {
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
				Update: {
					id?: string
					cedula?: string
					nombre?: string
					edad?: number | null
					telefono?: string | null
					email?: string | null
					created_at?: string | null
					updated_at?: string | null
					version?: number | null
				}
				Relationships: []
			}
			medical_records_clean: {
				Row: {
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
					total_amount: number
					exchange_rate: number | null
					payment_status: string
					remaining: number
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
					comments: string | null
					code: string | null
					created_at: string | null
					updated_at: string | null
					created_by: string | null
					created_by_display_name: string | null
					material_remitido: string | null
					informacion_clinica: string | null
					descripcion_macroscopica: string | null
					diagnostico: string | null
					comentario: string | null
					pdf_en_ready: boolean | null
					attachment_url: string | null
					inmunohistoquimica: string | null
					ims: string | null
					googledocs_url: string | null
					informepdf_url: string | null
					informe_qr: string | null
					generated_by: string | null
					generated_by_display_name: string | null
					generated_at: string | null
					log: string | null
					token: string | null
					doc_aprobado?: 'faltante' | 'pendiente' | 'aprobado'
				}
				Insert: {
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
					total_amount: number
					exchange_rate?: number | null
					payment_status?: string
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
					comments?: string | null
					code?: string | null
					created_at?: string
					updated_at?: string
					created_by?: string | null
					created_by_display_name?: string | null
					material_remitido?: string | null
					informacion_clinica?: string | null
					descripcion_macroscopica?: string | null
					diagnostico?: string | null
					comentario?: string | null
					pdf_en_ready?: boolean | null
					attachment_url?: string | null
					inmunohistoquimica?: string | null
					positivo?: string | null
					negativo?: string | null
					ki67?: string | null
					conclusion_diagnostica?: string | null
					generated_by?: string | null
					generated_by_display_name?: string | null
					generated_at?: string | null
					ims?: string | null
					googledocs_url?: string | null
					informepdf_url?: string | null
					informe_qr?: string | null
					doc_aprobado?: 'faltante' | 'pendiente' | 'aprobado'
				}
				Update: {
					id?: string
					full_name?: string
					id_number?: string
					phone?: string
					edad?: string | null
					email?: string | null
					exam_type?: string
					origin?: string
					treating_doctor?: string
					sample_type?: string
					number_of_samples?: number
					relationship?: string | null
					branch?: string
					date?: string
					total_amount?: number
					exchange_rate?: number | null
					payment_status?: string
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
					comments?: string | null
					code?: string | null
					created_at?: string
					updated_at?: string
					created_by?: string | null
					created_by_display_name?: string | null
					material_remitido?: string | null
					informacion_clinica?: string | null
					descripcion_macroscopica?: string | null
					diagnostico?: string | null
					comentario?: string | null
					pdf_en_ready?: boolean | null
					attachment_url?: string | null
					inmunohistoquimica?: string | null
					positivo?: string | null
					negativo?: string | null
					ki67?: string | null
					conclusion_diagnostica?: string | null
					generated_by?: string | null
					generated_by_display_name?: string | null
					generated_at?: string | null
					ims?: string | null
					googledocs_url?: string | null
					informepdf_url?: string | null
					informe_qr?: string | null
					doc_aprobado?: 'faltante' | 'pendiente' | 'aprobado'
				}
				Relationships: []
			}
			immuno_requests: {
				Row: {
					id: string
					case_id: string
					inmunorreacciones: string
					n_reacciones: number
					precio_unitario: number
					total: number
					pagado: boolean
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					case_id: string
					inmunorreacciones: string
					n_reacciones: number
					precio_unitario?: number
					total: number
					pagado?: boolean
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					case_id?: string
					inmunorreacciones?: string
					n_reacciones?: number
					precio_unitario?: number
					total?: number
					pagado?: boolean
					created_at?: string
					updated_at?: string
				}
				Relationships: []
			}
			profiles: {
				Row: {
					id: string
					email: string
					role: 'owner' | 'employee' | 'admin'
					created_at: string
					updated_at: string
					assigned_branch: string | null
					display_name: string | null
					estado: 'pendiente' | 'aprobado'
					phone: string | null
				}
				Insert: {
					id: string
					email: string
					role?: 'owner' | 'employee' | 'admin'
					created_at?: string
					updated_at?: string
					assigned_branch?: string | null
					display_name?: string | null
					estado?: 'pendiente' | 'aprobado'
					phone?: string | null
				}
				Update: {
					id?: string
					email?: string
					role?: 'owner' | 'employee' | 'admin'
					created_at?: string
					updated_at?: string
					assigned_branch?: string | null
					display_name?: string | null
					estado?: 'pendiente' | 'aprobado'
					phone?: string | null
				}
				Relationships: []
			}
			registration_submissions: {
				Row: {
					age: string | null
					best_time_to_trade: string | null
					country: string | null
					created_at: string
					email: string
					financial_goals: string | null
					full_name: string
					hfm_id: string | null
					id: string
					operating_time: string | null
					phone: string | null
					risk_knowledge: string | null
					starting_capital: string | null
					traded_assets: string | null
					trading_session: string | null
					trading_style: string | null
				}
				Insert: {
					age?: string | null
					best_time_to_trade?: string | null
					country?: string | null
					created_at?: string
					email: string
					financial_goals?: string | null
					full_name: string
					hfm_id?: string | null
					id?: string
					operating_time?: string | null
					phone?: string | null
					risk_knowledge?: string | null
					starting_capital?: string | null
					traded_assets?: string | null
					trading_session?: string | null
					trading_style?: string | null
				}
				Update: {
					age?: string | null
					best_time_to_trade?: string | null
					country?: string | null
					created_at?: string
					email?: string
					financial_goals?: string | null
					full_name?: string
					hfm_id?: string | null
					id?: string
					operating_time?: string | null
					phone?: string | null
					risk_knowledge?: string | null
					starting_capital?: string | null
					traded_assets?: string | null
					trading_session?: string | null
					trading_style?: string | null
				}
				Relationships: []
			}
			'Tips Asesores': {
				Row: {
					'¿Enviado a Telegram?': boolean | null
					Fecha: string | null
					'Fuente (RSS)': string | null
					id: number
					'ID del artículo': string | null
					'Tip generado': string | null
				}
				Insert: {
					'¿Enviado a Telegram?'?: boolean | null
					Fecha?: string | null
					'Fuente (RSS)'?: string | null
					id?: number
					'ID del artículo'?: string | null
					'Tip generado'?: string | null
				}
				Update: {
					'¿Enviado a Telegram?'?: boolean | null
					Fecha?: string | null
					'Fuente (RSS)'?: string | null
					id?: number
					'ID del artículo'?: string | null
					'Tip generado'?: string | null
				}
				Relationships: []
			}
			change_logs: {
				Row: {
					id: string
					medical_record_id: string | null
					patient_id: string | null
					entity_type: string | null
					user_id: string
					user_email: string
					user_display_name: string | null
					field_name: string
					field_label: string
					old_value: string | null
					new_value: string | null
					changed_at: string
					created_at: string | null
					deleted_record_info: string | null
				}
				Insert: {
					id?: string
					medical_record_id?: string | null
					patient_id?: string | null
					entity_type?: string | null
					user_id: string
					user_email: string
					user_display_name?: string | null
					field_name: string
					field_label: string
					old_value?: string | null
					new_value?: string | null
					changed_at?: string
					created_at?: string | null
					deleted_record_info?: string | null
				}
				Update: {
					id?: string
					medical_record_id?: string | null
					patient_id?: string | null
					entity_type?: string | null
					user_id?: string
					user_email?: string
					user_display_name?: string | null
					field_name?: string
					field_label?: string
					old_value?: string | null
					new_value?: string | null
					changed_at?: string
					created_at?: string | null
					deleted_record_info?: string | null
				}
				Relationships: []
			}
			user_settings: {
				Row: {
					id: string
					session_timeout: number
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					session_timeout?: number
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					session_timeout?: number
					created_at?: string | null
					updated_at?: string | null
				}
				Relationships: []
			}
		}
		Views: {
			medical_cases_with_patient: {
				Row: {
					// Campos de medical_records_clean
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
					total_amount: number
					exchange_rate: number | null
					payment_status: string
					remaining: number
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
					comments: string | null
					code: string | null
					created_at: string | null
					updated_at: string | null
					created_by: string | null
					created_by_display_name: string | null
					material_remitido: string | null
					informacion_clinica: string | null
					descripcion_macroscopica: string | null
					diagnostico: string | null
					comentario: string | null
					pdf_en_ready: boolean | null
					attachment_url: string | null
					archivo_adjunto_url: string | null
					doc_aprobado: 'faltante' | 'pendiente' | 'aprobado' | null
					generated_by: string | null
					version: number | null
					// Campos de patients
					cedula: string
					nombre: string
					edad: number | null
					telefono: string | null
					patient_email: string | null
				}
				Insert: {
					[_ in never]: never
				}
				Update: {
					[_ in never]: never
				}
				Relationships: []
			}
			patient_statistics: {
				Row: {
					id: string
					cedula: string
					nombre: string
					edad: number | null
					telefono: string | null
					email: string | null
					total_cases: number | null
					total_spent: number | null
					last_visit: string | null
				}
				Insert: {
					[_ in never]: never
				}
				Update: {
					[_ in never]: never
				}
				Relationships: []
			}
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
	? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R
	  }
		? R
		: never
	: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I
	  }
		? I
		: never
	: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U
	  }
		? U
		: never
	: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
	? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
	: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes'] | { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
	? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
	: never

export const Constants = {
	public: {
		Enums: {},
	},
} as const

export type MedicalRecordInsert = TablesInsert<'medical_records_clean'>

// Tipo unificado para MedicalRecord que incluye todos los campos necesarios
export type MedicalRecord = Database['public']['Views']['medical_cases_with_patient']['Row'] & {
	// Alias para compatibilidad con el código existente
	full_name: string // apunta a nombre
	id_number: string // apunta a cedula
	phone: string | null // apunta a telefono
	edad_display?: string // para compatibilidad
	email: string | null // apunta a patient_email
	// Campos adicionales para compatibilidad
	inmuno?: string // Campo legacy
	ims?: string | null // Campo para inmunorreacciones
	positivo?: string | null
	negativo?: string | null
	ki67?: string | null
	conclusion_diagnostica?: string | null
	archivo_adjunto_url?: string | null
	version?: number | null
}
