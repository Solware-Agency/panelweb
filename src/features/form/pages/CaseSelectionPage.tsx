import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase/config';
import { getMedicalRecords } from '@lib/supabase-service';
import { useToast } from '@shared/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CaseSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Query for fetching biopsia cases
  const { data: biopsiaRecords, isLoading, refetch } = useQuery({
    queryKey: ['biopsia-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records_clean')
        .select('id, code, full_name, id_number, exam_type, date, created_at')
        .ilike('exam_type', '%biopsia%') // Changed to case-insensitive search
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      console.log('Loaded biopsia records:', data?.length || 0);
      return data || [];
    },
    staleTime: 0, // Always refetch
    retry: 2,
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: '❌ Término de búsqueda requerido',
        description: 'Por favor ingresa un código, cédula o nombre para buscar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('medical_records_clean')
        .select('id, code, full_name, id_number, exam_type, date, created_at')
        .ilike('exam_type', '%biopsia%') // Changed to case-insensitive search
        .or(`code.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        // If only one result, navigate directly to that case
        if (data.length === 1) {
          navigate(`/generar-caso/${data[0].id}`);
        } else {
          // Otherwise, update the results via refetch
          refetch();
        }
      } else {
        toast({
          title: '❌ No se encontraron resultados',
          description: 'No se encontraron casos de biopsia con ese criterio de búsqueda.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error searching cases:', error);
      toast({
        title: '❌ Error en la búsqueda',
        description: 'Hubo un problema al buscar casos. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCaseSelect = (id: string) => {
    navigate(`/generar-caso/${id}`);
  };

  const handleBackToForm = () => {
    navigate('/form');
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seleccionar Caso de Biopsia</h1>
        <Button 
          onClick={handleBackToForm} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>
      
      <Card className="mb-6 p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
        <div className="mb-2">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Busca por código, cédula o nombre del paciente para generar o editar un caso de biopsia.
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por código, cédula o nombre..."
              value={searchTerm}
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                'No se encontraron casos que coincidan con tu búsqueda.' : 
                'Busca por código, cédula o nombre para encontrar casos de biopsia.'
              }}
            />
            <p className="text-gray-500 mt-2">
              Solo se mostrarán casos del tipo "biopsia".
            </p>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="bg-primary hover:bg-primary/80"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
              <span>Cargando casos de biopsia...</span>
            </div>
          ) : biopsiaRecords && biopsiaRecords.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {biopsiaRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleCaseSelect(record.id)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{record.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">CI: {record.id_number}</p>
                      {record.date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fecha: {format(new Date(record.date), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {record.code && (
                        <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                          {record.code}
                        </span>
                      )}
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCaseSelect(record.id);
                        }}
                      >
                        Generar Caso
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                {searchTerm ? 
                  'No se encontraron casos que coincidan con tu búsqueda' : 
                  'Busca por código, cédula o nombre para encontrar casos de biopsia'
                }
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CaseSelectionPage;