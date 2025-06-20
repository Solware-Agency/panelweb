import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { type Cliente } from '@/lib/supabase-service';

interface MedicalRecordsTableProps {
  records: Cliente[];
  isLoading: boolean;
  error: any;
}

export const MedicalRecordsTable: React.FC<MedicalRecordsTableProps> = ({
  records,
  isLoading,
  error,
}) => {
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'Completado': { variant: 'default' as const, className: 'bg-green-100 text-green-800 cursor-pointer' },
      'Pendiente': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 cursor-pointer' },
      'Incompleto': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 cursor-pointer' },
    };
 
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pendiente'];
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar registros</h3>
        <p className="text-red-600 mb-4">{error.message || 'Hubo un problema al obtener los datos.'}</p>
        <p className="text-sm text-red-500">
          Verifica tu conexión a internet o contacta al supervisor.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay registros</h3>
        <p className="text-gray-500">
          No se encontraron registros médicos. Crea el primer registro usando el formulario.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-900">Nombre</TableHead>
            <TableHead className="font-semibold text-gray-900">Cédula</TableHead>
            <TableHead className="font-semibold text-gray-900">Teléfono</TableHead>
            <TableHead className="font-semibold text-gray-900">Sede</TableHead>
            <TableHead className="font-semibold text-gray-900">Monto</TableHead>
            <TableHead className="font-semibold text-gray-900">Estado</TableHead>
            <TableHead className="font-semibold text-gray-900">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="hover:bg-gray-200 transition-colors cursor-pointer">
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold text-gray-900">{record.full_name}</div>
                  <div className="text-sm text-gray-500">{record.exam_type}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{record.id_number}</TableCell>
              <TableCell className="text-gray-700">{record.phone}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-gray-700">
                  {record.branch}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-gray-700">
                {formatCurrency(record.total_amount)}
                {record.remaining && record.remaining > 0 && (
                  <div className="text-xs text-red-600">
                    Resta: {formatCurrency(record.remaining)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(record.payment_status)}
              </TableCell>
              <TableCell className="text-gray-600">
                {record.created_at ? format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};