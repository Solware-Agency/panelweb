import { supabase } from "@/integrations/supabase/client";
import { type FormValues } from "./form-schema";
import { prepareSubmissionData } from "./prepareSubmissionData";

export interface MedicalRecord {
  id?: string;
  full_name: string;
  id_number: string;
  phone: string;
  age: number;
  email?: string;
  date: string;
  exam_type: string;
  origin: string;
  treating_doctor: string;
  sample_type: string;
  number_of_samples: number;
  relationship?: string;
  branch: string;
  total_amount: number;
  exchange_rate?: number;
  payment_status: string;
  remaining: number;
  payment_method_1?: string;
  payment_amount_1?: number;
  payment_reference_1?: string;
  payment_method_2?: string;
  payment_amount_2?: number;
  payment_reference_2?: string;
  payment_method_3?: string;
  payment_amount_3?: number;
  payment_reference_3?: string;
  payment_method_4?: string;
  payment_amount_4?: number;
  payment_reference_4?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

// Nombre de la tabla nueva y limpia
const TABLE_NAME = 'medical_records_clean';

export const testConnection = async () => {
  try {
    console.log(`🔍 Probando conexión con Supabase (tabla ${TABLE_NAME})...`);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error en test de conexión:', error);
      return { success: false, error };
    }

    console.log(`✅ Test de conexión exitoso con tabla ${TABLE_NAME}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error inesperado en test de conexión:', error);
    return { success: false, error };
  }
};

export const insertMedicalRecord = async (
  formData: FormValues,
  exchangeRate?: number
): Promise<{ data: MedicalRecord | null; error: any }> => {
  try {
    console.log(`🚀 Iniciando inserción en tabla ${TABLE_NAME}...`);
    
    // Primero probamos la conexión
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.error('❌ Fallo en test de conexión:', connectionTest.error);
      return { 
        data: null, 
        error: { 
          message: 'No se pudo conectar con la base de datos. Verifica tu conexión a internet.',
          code: 'CONNECTION_FAILED',
          details: connectionTest.error
        }
      };
    }

    const submissionData = prepareSubmissionData(formData, exchangeRate);
    console.log(`📋 Datos preparados para ${TABLE_NAME}:`, submissionData);
    
    // Convertir los datos preparados para que coincidan con el esquema de la base de datos
    const recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'> = {
      full_name: submissionData.fullName,
      id_number: submissionData.idNumber,
      phone: submissionData.phone,
      age: Number(submissionData.age),
      email: submissionData.email || undefined,
      date: submissionData.date,
      exam_type: submissionData.examType,
      origin: submissionData.origin,
      treating_doctor: submissionData.treatingDoctor,
      sample_type: submissionData.sampleType,
      number_of_samples: submissionData.numberOfSamples,
      relationship: submissionData.relationship || undefined,
      branch: submissionData.branch,
      total_amount: submissionData.totalAmount,
      exchange_rate: submissionData.exchangeRate || undefined,
      payment_status: submissionData.paymentStatus,
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
    };

    console.log(`💾 Insertando datos en tabla ${TABLE_NAME}:`, recordData);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([recordData])
      .select()
      .single();

    if (error) {
      console.error(`❌ Error insertando en ${TABLE_NAME}:`, error);
      
      // Manejo específico de errores
      if (error.code === 'PGRST116') {
        return { 
          data: null, 
          error: { 
            message: `La tabla ${TABLE_NAME} no existe. Ejecuta la migración create_medical_records_clean.sql`,
            code: 'TABLE_NOT_EXISTS',
            details: error
          }
        };
      }
      
      if (error.code === '42P01') {
        return { 
          data: null, 
          error: { 
            message: `Error de base de datos: tabla ${TABLE_NAME} no encontrada.`,
            code: 'TABLE_NOT_FOUND',
            details: error
          }
        };
      }

      if (error.code === '23514') {
        return { 
          data: null, 
          error: { 
            message: 'Error de validación: verifica que todos los campos cumplan las restricciones.',
            code: 'VALIDATION_ERROR',
            details: error
          }
        };
      }

      return { data: null, error };
    }

    console.log(`✅ Registro médico insertado exitosamente en ${TABLE_NAME}:`, data);
    return { data: data as Cliente, error: null };
  } catch (error) {
    console.error(`❌ Error inesperado insertando en ${TABLE_NAME}:`, error);
    
    // Si es un error de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { 
        data: null, 
        error: { 
          message: 'Error de conexión de red. Verifica tu conexión a internet.',
          code: 'NETWORK_ERROR',
          details: error
        }
      };
    }
    
    return { data: null, error };
  }
};

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