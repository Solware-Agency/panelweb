import React from 'react'
import { X, User, Stethoscope, CreditCard, FileText, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { MedicalCase } from '@/types/case'

interface CaseDetailPanelProps {
  case_: MedicalCase | null
  isOpen: boolean
  onClose: () => void
}

const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({ case_, isOpen, onClose }) => {
  if (!case_) return null

  const getStatusColor = (status: MedicalCase['estatus']) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'Cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPaymentStatusColor = (status: MedicalCase['estatusPagoInforme']) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'Pagado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'Enviado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const InfoSection = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      {children}
    </div>
  )

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-sm text-gray-900 dark:text-gray-100 sm:text-right">{value || 'N/A'}</span>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Caso {case_.codigo}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {case_.nombreCompleto}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(case_.estatus)}`}>
                  {case_.estatus}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(case_.estatusPagoInforme)}`}>
                  {case_.estatusPagoInforme}
                </span>
                {case_.verificacion && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </span>
                )}
                {case_.enviado && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <CheckCircle className="w-3 h-3" />
                    Enviado
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Patient Information */}
              <InfoSection title="Información del Paciente" icon={User}>
                <div className="space-y-1">
                  <InfoRow label="Nombre completo" value={case_.nombreCompleto} />
                  <InfoRow label="Cédula" value={case_.cedula} />
                  <InfoRow label="Edad" value={`${case_.edad} años`} />
                  <InfoRow label="Teléfono" value={case_.telefono} />
                  <InfoRow label="Email" value={case_.email} />
                  <InfoRow label="Relación" value={case_.relacion} />
                </div>
              </InfoSection>

              {/* Medical Information */}
              <InfoSection title="Información Médica" icon={Stethoscope}>
                <div className="space-y-1">
                  <InfoRow label="Estudio" value={case_.estudio} />
                  <InfoRow label="Médico tratante" value={case_.medicoTratante} />
                  <InfoRow label="Procedencia" value={case_.procedencia} />
                  <InfoRow label="Sede" value={case_.sedes} />
                  <InfoRow label="Muestra" value={case_.muestra} />
                  <InfoRow label="Cantidad de muestras" value={case_.cantidadMuestras} />
                  <InfoRow label="Fecha de ingreso" value={new Date(case_.fechaIngreso).toLocaleDateString('es-ES')} />
                </div>
              </InfoSection>

              {/* Financial Information */}
              <InfoSection title="Información Financiera" icon={CreditCard}>
                <div className="space-y-1">
                  <InfoRow label="Monto total" value={`$${case_.montoTotal.toLocaleString()}`} />
                  <InfoRow label="Monto faltante" value={`$${case_.montoFaltante.toLocaleString()}`} />
                  <InfoRow label="Tasa" value={case_.tasa.toFixed(2)} />
                </div>

                {/* Payment Methods */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formas de Pago:</h4>
                  <div className="space-y-2">
                    {case_.formaPago1 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{case_.formaPago1}</span>
                          <span className="text-sm">${case_.monto1?.toLocaleString()}</span>
                        </div>
                        {case_.referenciaPago1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {case_.referenciaPago1}
                          </div>
                        )}
                        {case_.conversion1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Conversión: {case_.conversion1.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}

                    {case_.formaPago2 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{case_.formaPago2}</span>
                          <span className="text-sm">${case_.monto2?.toLocaleString()}</span>
                        </div>
                        {case_.referenciaPago2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {case_.referenciaPago2}
                          </div>
                        )}
                        {case_.conversion2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Conversión: {case_.conversion2.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}

                    {case_.formaPago3 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{case_.formaPago3}</span>
                          <span className="text-sm">${case_.monto3?.toLocaleString()}</span>
                        </div>
                        {case_.referenciaPago3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {case_.referenciaPago3}
                          </div>
                        )}
                        {case_.conversion3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Conversión: {case_.conversion3.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}

                    {case_.formaPago4 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{case_.formaPago4}</span>
                          <span className="text-sm">${case_.monto4?.toLocaleString()}</span>
                        </div>
                        {case_.referenciaPago4 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {case_.referenciaPago4}
                          </div>
                        )}
                        {case_.conversion4 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Conversión: {case_.conversion4.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </InfoSection>

              {/* Additional Information */}
              <InfoSection title="Información Adicional" icon={FileText}>
                <div className="space-y-1">
                  <InfoRow label="Encabezados" value={case_.encabezados} />
                  <InfoRow label="Informe QR" value={case_.informeQR} />
                  {case_.comentarios && (
                    <div className="py-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                        {case_.comentarios}
                      </p>
                    </div>
                  )}
                </div>
              </InfoSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CaseDetailPanel