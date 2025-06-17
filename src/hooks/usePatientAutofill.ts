import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type UseFormSetValue } from 'react-hook-form';
import type { FormValues } from '@/lib/form-schema';

interface PatientData {
  full_name: string;
  phone: string;
  age: number;
  email: string | null;
}

export const usePatientAutofill = (setValue: UseFormSetValue<FormValues>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastFilledPatient, setLastFilledPatient] = useState<string | null>(null);

  const fillPatientData = async (idNumber: string, silent: boolean = false) => {
    if (!idNumber || idNumber.length < 6) return; // Mínimo 6 dígitos para buscar

    setIsLoading(true);
    
    try {
      // Buscar el registro más reciente con esta cédula
      const { data, error } = await supabase
        .from('medical_records_clean')
        .select('full_name, phone, age, email')
        .eq('id_number', idNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no se encuentra, no hacer nada (no es un error crítico)
        if (error.code === 'PGRST116') {
          console.log('No se encontraron registros previos para esta cédula');
        }
        return;
      }

      if (data) {
        // Primero, ocultar todas las sugerencias de autocompletado
        window.dispatchEvent(new CustomEvent('hideAllAutocompleteSuggestions'));
        
        // Pequeño delay para asegurar que las sugerencias se oculten antes de llenar
        setTimeout(() => {
          // Llenar automáticamente los campos del paciente
          setValue('fullName', data.full_name);
          setValue('phone', data.phone);
          setValue('age', data.age);
          setValue('email', data.email || '');
          
          setLastFilledPatient(data.full_name);
          
          // Solo mostrar notificación si no es silencioso
          if (!silent) {
            console.log('✅ Datos del paciente cargados automáticamente:', data);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error al buscar datos del paciente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fillPatientData,
    isLoading,
    lastFilledPatient
  };
};