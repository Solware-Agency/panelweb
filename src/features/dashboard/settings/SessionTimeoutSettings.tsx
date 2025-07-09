import React from 'react';
import { Card } from '@shared/components/ui/card';
import { Clock, Shield, CheckCircle } from 'lucide-react';
import { useSessionTimeout, SESSION_TIMEOUT_OPTIONS } from '@shared/hooks/useSessionTimeout';
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group';
import { Label } from '@shared/components/ui/label';

export function SessionTimeoutSettings() {
  const { sessionTimeout, updateUserTimeout, isLoading } = useSessionTimeout();

  const handleTimeoutChange = (value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes)) {
      updateUserTimeout(minutes);
    }
  };

  // Format minutes for display
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else {
      return `${minutes / 60} hora${minutes > 60 ? 's' : ''}`;
    }
  };

  return (
    <Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold">Tiempo de Sesión</h3>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                Configuración de seguridad
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Por su seguridad, su sesión se cerrará automáticamente después del tiempo de inactividad seleccionado. 
                Un tiempo más corto proporciona mayor seguridad, mientras que un tiempo más largo ofrece mayor comodidad.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Seleccione el tiempo de inactividad:</h4>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              ))}
            </div>
          ) : (
            <RadioGroup 
              defaultValue={sessionTimeout.toString()} 
              onValueChange={handleTimeoutChange}
              className="space-y-2"
            >
              {SESSION_TIMEOUT_OPTIONS.map(minutes => (
                <div 
                  key={minutes}
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    sessionTimeout === minutes 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  } hover:border-primary hover:bg-primary/5 transition-colors`}
                >
                  <RadioGroupItem value={minutes.toString()} id={`timeout-${minutes}`} />
                  <Label 
                    htmlFor={`timeout-${minutes}`}
                    className="flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{formatMinutes(minutes)}</span>
                    {sessionTimeout === minutes && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Su sesión actual está configurada para expirar después de {formatMinutes(sessionTimeout)} de inactividad.</p>
          <p>• Los cambios en esta configuración se aplicarán inmediatamente.</p>
          <p>• Si cierra sesión manualmente, deberá iniciar sesión nuevamente independientemente de esta configuración.</p>
        </div>
      </div>
    </Card>
  );
}