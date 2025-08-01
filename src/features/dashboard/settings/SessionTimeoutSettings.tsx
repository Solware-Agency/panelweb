import { Card } from '@shared/components/ui/card';
import { Clock, Shield } from 'lucide-react';
import { useAuth } from '@app/providers/AuthContext'
import { SESSION_TIMEOUT_OPTIONS } from '@shared/hooks/useSessionTimeoutSettings'
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group'
import { Label } from '@shared/components/ui/label'

export function SessionTimeoutSettings() {
	const { sessionTimeout, updateUserTimeout, isLoadingTimeout, user } = useAuth()

	const handleTimeoutChange = (value: string) => {
		const minutes = parseInt(value, 10)
		if (!isNaN(minutes)) {
			updateUserTimeout(minutes)
		}
	}

	const formatMinutes = (minutes: number) => {
		if (minutes < 60) return `${minutes} minutos`
		return `${minutes / 60} hora${minutes > 60 ? 's' : ''}`
	}

	return (
		<Card className="w-full mx-auto mt-6">
			<div className="p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
					<h3 className="text-lg font-semibold">Tiempo de inactividad</h3>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Columna izquierda - Configuración principal */}
					<div>
						<div className="flex items-start space-x-3 mb-4">
							<Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
							<div>
								<p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">Configuración de seguridad</p>
								<p className="text-xs text-blue-700 dark:text-blue-400">
									Por su seguridad, su sesión se cerrará automáticamente después del tiempo de inactividad seleccionado. Un
									tiempo más corto proporciona mayor seguridad, mientras que un tiempo más largo ofrece mayor comodidad.
								</p>
							</div>
						</div>
						
						<h4 className="text-sm font-medium mb-3">Seleccione el tiempo de inactividad:</h4>
						{isLoadingTimeout ? (
							<div className="animate-pulse space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
								))}
							</div>
						) : (
							<RadioGroup value={sessionTimeout.toString()} onValueChange={handleTimeoutChange} className="space-y-1.5">
								{SESSION_TIMEOUT_OPTIONS.map((minutes) => (
									<div
										key={minutes}
										className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer ${
											sessionTimeout === minutes ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
										} hover:border-primary hover:bg-primary/5 transition-none`}
										onClick={() => handleTimeoutChange(minutes.toString())}
									>
										<RadioGroupItem value={minutes.toString()} id={`timeout-${minutes}`} />
										<Label htmlFor={`timeout-${minutes}`} className="flex items-center space-x-2 cursor-pointer flex-1">
											<span className="text-sm">{formatMinutes(minutes)}</span>
										</Label>
									</div>
								))}
							</RadioGroup>
						)}
					</div>

					{/* Columna derecha - Información de seguridad */}
					<div className="lg:border-l lg:border-gray-200 dark:border-gray-700 lg:pl-6">
						<div className="space-y-4">
							{/* Información de seguridad */}
							<div className="space-y-3">
								<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
									<h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Último inicio de sesión</h3>
									<p className="text-blue-700 dark:text-blue-400">
										{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'No disponible'}
									</p>
								</div>
							</div>

							{/* Recomendaciones de seguridad */}
							<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
								<h3 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Recomendaciones de seguridad</h3>
								<ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-400 text-sm">
									<li>Utiliza contraseñas fuertes con al menos 8 caracteres, incluyendo números y símbolos.</li>
									<li>No compartas tu contraseña con nadie.</li>
									<li>Cambia tu contraseña regularmente para mayor seguridad.</li>
									<li>Cierra sesión cuando utilices dispositivos compartidos.</li>
								</ul>
							</div>

							{/* Información del tiempo de inactividad */}
							<div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
								<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
									<p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Información actual:</p>
									<p>
										• Su sesión actual está configurada para expirar después de {formatMinutes(sessionTimeout)} de inactividad.
									</p>
								</div>
								
								<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
									<p className="font-medium text-blue-700 dark:text-blue-300 mb-2">Notas importantes:</p>
									<p className="mb-1">• Los cambios en esta configuración se aplicarán inmediatamente.</p>
									<p>• Si cierra sesión manualmente, deberá iniciar sesión nuevamente independientemente de esta configuración.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}