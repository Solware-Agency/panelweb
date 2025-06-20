import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MedicalRecordsTable from './MedicalRecordsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientes, searchClientes } from '@/lib/supabase-service';

export const RecordsSection: React.FC = () => {
  const [searchTerm] = useState('');

  // Query for all records (when no search term)
  const {
    data: allRecords,
    isLoading: isLoadingAll,    
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => getClientes(50, 0),
    enabled: !searchTerm,
  });

  // Query for search results
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['clientes-search', searchTerm],
    queryFn: () => searchClientes(searchTerm),
    enabled: !!searchTerm,
  });

  const handleRefresh = () => {
    if (searchTerm) {
      refetchSearch();
    } else {
      refetchAll();
    }
  };

  // Determine which data to use
  const records = searchTerm ? searchResults?.data : allRecords?.data;
  const isLoading = searchTerm ? isLoadingSearch : isLoadingAll;

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!records) return { total: 0, totalAmount: 0, completed: 0 };

    const total = records.length;
    const totalAmount = records.reduce((sum, record) => sum + record.total_amount, 0);
    const completed = records.filter(record => record.payment_status === 'Completado').length;

    return { total, totalAmount, completed };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header with search and refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registros de Clientes</h2>
          <p className="text-muted-foreground">
            {searchTerm ? `Resultados de búsqueda para "${searchTerm}"` : 'Todos los registros médicos'}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Statistics cards */}
      {!searchTerm && records && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                registros en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                en montos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Completados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.total} registros ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results count for search */}
      {searchTerm && records && (
        <div className="text-sm text-muted-foreground">
          Se encontraron {records.length} resultado{records.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Records table */}
      <MedicalRecordsTable />
    </div>
  );
};