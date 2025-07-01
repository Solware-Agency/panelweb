import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@shared/components/ui/dialog';
import { Input } from '@shared/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase/config';
import { useToast } from '@shared/hooks/use-toast';

const GenerateCaseButton: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Query for fetching biopsia cases
  const { data: biopsiaRecords, isLoading, refetch } = useQuery({
    queryKey: ['biopsia-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records_clean')
        .select('id, code, full_name, id_number, exam_type')
        .eq('exam_type', 'biopsia')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: false, // Don't fetch on component mount
  });

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsDialogOpen(true);
    refetch(); // Fetch biopsia records when dialog opens
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: '❌ Término de búsqueda requerido',
        description: 'Por favor ingresa un código o cédula para buscar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('medical_records_clean')
        .select('id, code, full_name, id_number, exam_type')
        .eq('exam_type', 'biopsia')
        .or(`code.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        // If only one result, navigate directly to that case
        if (data.length === 1) {
          setIsDialogOpen(false);
          navigate(`/generar-caso/${data[0].id}`);
        } else {
          // Otherwise, update the results
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
    setIsDialogOpen(false);
    navigate(`/generar-caso/${id}`);
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      >
        Generar Caso
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Caso de Biopsia</DialogTitle>
            <DialogDescription>
              Busca por código, cédula o nombre del paciente para generar o editar un caso.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar por código, cédula o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando casos...</p>
                </div>
              ) : biopsiaRecords && biopsiaRecords.length > 0 ? (
                <div className="divide-y">
                  {biopsiaRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleCaseSelect(record.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.full_name}</p>
                          <p className="text-sm text-gray-500">CI: {record.id_number}</p>
                        </div>
                        {record.code && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {record.code}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron resultados' : 'Busca para ver resultados'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateCaseButton;