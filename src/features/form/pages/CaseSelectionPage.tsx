import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, FileText, BookCopy, AlertCircle } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase/config';
import { useToast } from '@shared/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CaseSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Query for fetching biopsia cases
  const { data: biopsiaRecords, isLoading, error, refetch } = useQuery({
    queryKey: ['biopsia-records'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('medical_records_clean')
          .select('id, code, full_name, exam_type')
          .ilike('exam_type', '%biopsia%') // Case-insensitive search
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        console.log('Loaded biopsia records:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('Error fetching biopsia records:', err);
        throw err;
      }
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
        .select('id, code, full_name, exam_type')
        .ilike('exam_type', '%biopsia%') // Case-insensitive search
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

  // Render error state if there's an error fetching data
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Generar Caso</h1>
          <Button 
            onClick={handleBackToForm} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertCircle className="text-red-500 size-12" />
            <h2 className="text-xl font-semibold">Error al cargar los casos</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Hubo un problema al cargar los casos de biopsia. Por favor intenta de nuevo.
            </p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4 bg-primary hover:bg-primary/80"
            >
              <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Generar Caso</h1>
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
        <div className="flex items-center gap-2 mb-4">
          <BookCopy className="text-primary size-5" />
          <h2 className="text-lg font-semibold">Buscar caso por número, paciente o tipo de examen</h2>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ingresa el número del caso, nombre del paciente o tipo de examen para generar el caso.
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Input 
              placeholder="Ingresa el número de caso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 focus:border-primary transition-all text-lg py-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" size={18} />
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
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="text-primary size-5" /> 
              Resultados de casos
            </h2>
            <p className="text-sm text-gray-500">
              {!isLoading && biopsiaRecords ? `${biopsiaRecords.length} casos encontrados` : ''}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
              <span>Cargando casos de biopsia...</span>
            </div>
          ) : biopsiaRecords && biopsiaRecords.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                    <th className="p-3 text-gray-500 dark:text-gray-400 font-medium">NÚMERO DE CASO</th>
                    <th className="p-3 text-gray-500 dark:text-gray-400 font-medium">TIPO DE EXAMEN</th>
                    <th className="p-3 text-gray-500 dark:text-gray-400 font-medium">PACIENTE</th>
                    <th className="p-3 text-gray-500 dark:text-gray-400 font-medium text-right">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {biopsiaRecords.map((record) => (
                    <tr 
                      key={record.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => handleCaseSelect(record.id)}
                    >
                      <td className="p-3 font-medium">
                        <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
                          {record.code || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{record.exam_type}</td>
                      <td className="p-3 font-medium">{record.full_name}</td>
                      <td className="p-3 text-right">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCaseSelect(record.id);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ?
                  'No se encontraron casos con ese número' :
                  'Ingresa el número del caso para buscar'
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile View - Will replace the table on small screens */}
      <div className="lg:hidden mt-4">
        <Card className="hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <span>Cargando casos de biopsia...</span>
              </div>
            ) : biopsiaRecords && biopsiaRecords.length > 0 ? (
              <div className="space-y-3">
                {biopsiaRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => handleCaseSelect(record.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{record.full_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{record.exam_type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.code && (
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                            Caso #{record.code}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCaseSelect(record.id);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Generar Caso
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 
                    'No se encontraron casos que coincidan con tu búsqueda' : 
                    'Busca por número de caso, paciente o tipo de examen'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CaseSelectionPage;