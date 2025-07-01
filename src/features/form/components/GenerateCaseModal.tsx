import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Search, FileText, Loader2, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Input } from '@shared/components/ui/input'
import { useNavigate } from 'react-router-dom'
import type { MedicalRecord } from '@lib/supabase-service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface GenerateCaseModalProps {
  isOpen: boolean
  onClose: () => void
}

const GenerateCaseModal: React.FC<GenerateCaseModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  
  // Query for medical records data - only biopsy type
  const {
    data: casesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['biopsy-cases'],
    queryFn: async () => {
      const { data, error } = await getMedicalRecords(100, 0)
      if (error) throw error
      
      // Filter only biopsy cases
      return {
        data: data?.filter(record => record.exam_type?.toLowerCase() === 'biopsia') || []
      }
    },
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Filter cases based on search term
  const filteredCases = React.useMemo(() => {
    if (!casesData?.data) return []
    
    return casesData.data.filter(case_ => 
      case_.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (case_.code && case_.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [casesData, searchTerm])

  // Handle case selection
  const handleSelectCase = (case_: MedicalRecord) => {
    // Navigate to the generar-caso route with the case data
    navigate(`/generar-caso/${case_.id}`)
    onClose()
  }

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

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
            className="fixed inset-0 bg-black/50 z-[999998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[999999] p-4"
          >
            <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Seleccionar Caso de Biopsia</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, cédula o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </div>

              {/* Cases List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-500 dark:text-red-400">Error al cargar los casos</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Intenta cerrar y abrir el modal nuevamente
                    </p>
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No se encontraron casos de biopsia</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Intenta con otra búsqueda
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCases.map((case_) => (
                      <div
                        key={case_.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectCase(case_)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {case_.full_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              CI: {case_.id_number} • {case_.date ? format(new Date(case_.date), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {case_.code && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mr-2">
                                {case_.code}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Show if case already has biopsy data */}
                        {(case_.material_remitido || case_.diagnostico) && (
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            Caso ya generado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Solo se muestran casos de tipo "biopsia"</p>
                  <p>Total: {filteredCases.length} casos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GenerateCaseModal