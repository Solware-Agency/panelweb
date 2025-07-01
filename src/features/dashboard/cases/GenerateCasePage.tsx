import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@lib/supabase/config';
import { useToast } from '@shared/hooks/use-toast';
import { format, parseISO, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@app/providers/AuthContext';

interface MedicalRecord {
  id: string;
  full_name: string;
  id_number: string;
  date_of_birth?: string;
  date: string;
  code?: string;
  treating_doctor: string;
  origin: string;
  exam_type: string;
  material_remitido?: string;
  informacion_clinica?: string;
  descripcion_macroscopica?: string;
  diagnostico?: string;
  comentario?: string;
}

const GenerateCasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    material_remitido: '',
    informacion_clinica: '',
    descripcion_macroscopica: '',
    diagnostico: '',
    comentario: ''
  });

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('medical_records_clean')
          .select('*, material_remitido, informacion_clinica, descripcion_macroscopica, diagnostico, comentario')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          console.log('Loaded record data:', data);
          // Verify this is a biopsia record
          if (data.exam_type !== 'biopsia') {
            toast({
              title: '❌ Tipo de examen incorrecto',
              description: 'Esta funcionalidad solo está disponible para casos de biopsia.',
              variant: 'destructive',
            });
            navigate('/cases-selection');
            return;
          }

          setRecord(data);
          
          // Initialize form with existing data if available
          setFormData({
            material_remitido: data.material_remitido || '',
            informacion_clinica: data.informacion_clinica || '',
            descripcion_macroscopica: data.descripcion_macroscopica || '',
            diagnostico: data.diagnostico || '',
            comentario: data.comentario || ''
          });
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        toast({
          title: '❌ Error al cargar el caso',
          description: 'No se pudo cargar la información del caso. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!record || !id || !user) return;

    setIsSaving(true);
    try {
      // Prepare the update data
      const updateData = {
        material_remitido: formData.material_remitido,
        informacion_clinica: formData.informacion_clinica,
        descripcion_macroscopica: formData.descripcion_macroscopica,
        diagnostico: formData.diagnostico,
        comentario: formData.comentario,
        updated_at: new Date().toISOString()
      };

      // Update the record
      const { error } = await supabase
        .from('medical_records_clean')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Log the changes
      await supabase.from('change_logs').insert([
        {
          medical_record_id: id,
          user_id: user.id,
          user_email: user.email || 'unknown@email.com',
          field_name: 'diagnostic_data',
          field_label: 'Datos de Diagnóstico',
          old_value: 'Actualización de datos de diagnóstico',
          new_value: 'Datos de diagnóstico actualizados'
        }
      ]);

      toast({
        title: '✅ Caso guardado exitosamente',
        description: 'Los datos del caso han sido guardados correctamente.',
        className: 'bg-green-100 border-green-400 text-green-800',
      });
    } catch (error) {
      console.error('Error saving case:', error);
      toast({
        title: '❌ Error al guardar',
        description: 'Hubo un problema al guardar los datos del caso. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return '';
    try {
      const birthDate = parseISO(dateOfBirth);
      const age = differenceInYears(new Date(), birthDate);
      return `${age} años`;
    } catch (error) {
      console.error('Error calculating age:', error);
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg">Cargando información del caso...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>No se pudo encontrar el caso solicitado.</p>
        </div>
        <Button 
          onClick={() => navigate(-1)} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generar Caso de Biopsia</h1>
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button 
          onClick={() => navigate('/cases-selection')} 
          variant="outline"
          className="ml-2"
        >
          Seleccionar otro caso
        </Button>
      </div>

      <Card className="p-6 mb-6 bg-gray-900 text-gray-200 font-mono">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="col-span-1">
            <span className="text-gray-400">NOMBRE:</span>
            <span className="ml-12">{record.full_name}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-400">FECHA:</span>
            <span className="ml-12">{format(new Date(record.date), 'dd/MM/yyyy', { locale: es })}</span>
          </div>
          
          <div className="col-span-1">
            <span className="text-gray-400">EDAD:</span>
            <span className="ml-12">{calculateAge(record.date_of_birth)}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-400">INFORME N.º</span>
            <span className="ml-2">
              <a href="#" className="text-blue-400 hover:underline">{record.code || 'N/A'}</a>
            </span>
          </div>
          
          <div className="col-span-1">
            <span className="text-gray-400">CI/ N.º HISTORIA:</span>
            <span className="ml-2">{record.id_number}</span>
          </div>
          <div className="col-span-1"></div>
          
          <div className="col-span-1">
            <span className="text-gray-400">DOCTOR(A):</span>
            <span className="ml-8">{record.treating_doctor}</span>
          </div>
          <div className="col-span-1"></div>
          
          <div className="col-span-1">
            <span className="text-gray-400">PROCEDENCIA:</span>
            <span className="ml-4">{record.origin}</span>
          </div>
        </div>
      </Card>

      <div className="border-b border-gray-300 dark:border-gray-700 my-6"></div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Material remitido:</label>
          <Textarea 
            name="material_remitido"
            value={formData.material_remitido}
            onChange={handleInputChange}
            className="min-h-[100px]"
            placeholder="Descripción del material remitido..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Información clínica:</label>
          <Textarea 
            name="informacion_clinica"
            value={formData.informacion_clinica}
            onChange={handleInputChange}
            className="min-h-[100px]"
            placeholder="Información clínica relevante..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción macroscópica:</label>
          <Textarea 
            name="descripcion_macroscopica"
            value={formData.descripcion_macroscopica}
            onChange={handleInputChange}
            className="min-h-[150px]"
            placeholder="Descripción macroscópica de la muestra..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Diagnóstico:</label>
          <Textarea 
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleInputChange}
            className="min-h-[150px]"
            placeholder="Diagnóstico del caso..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comentario:</label>
          <Textarea 
            name="comentario"
            value={formData.comentario}
            onChange={handleInputChange}
            className="min-h-[100px]"
            placeholder="Comentarios adicionales..."
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/80"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default GenerateCasePage;