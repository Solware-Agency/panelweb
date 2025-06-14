import React, { useState, useEffect } from 'react'
import { Plus, Download, Filter, RefreshCw } from 'lucide-react'
import { BackgroundGradient } from '../../../components/ui/background-gradient'
import CasesTable from '../../../components/cases/CasesTable'
import CaseDetailPanel from '../../../components/cases/CaseDetailPanel'
import { generateMockCases } from '../../../utils/mockCases'
import type { MedicalCase } from '../../../types/case'

const MainCases: React.FC = () => {
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const loadCases = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockCases = generateMockCases(75)
      setCases(mockCases)
      setLoading(false)
    }

    loadCases()
  }, [])

  const handleCaseSelect = (case_: MedicalCase) => {
    setSelectedCase(case_)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    // Delay clearing selected case to allow animation to complete
    setTimeout(() => setSelectedCase(null), 300)
  }

  const handleRefresh = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    const mockCases = generateMockCases(75)
    setCases(mockCases)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Casos Médicos</h1>
          <p className="text-white">Gestión y seguimiento de casos médicos</p>
        </div>

        <BackgroundGradient containerClassName="grid" className="grid">
          <div className="bg-white/80 dark:bg-gray-900 rounded-xl p-8 transition-colors duration-300">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-lg text-gray-700 dark:text-gray-300">Cargando casos...</span>
              </div>
            </div>
          </div>
        </BackgroundGradient>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <BackgroundGradient containerClassName="col-span-1 grid" className="grid">
          <button className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3 hover:bg-white dark:hover:bg-gray-800">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Nuevo Caso</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Registrar paciente</p>
            </div>
          </button>
        </BackgroundGradient>

        <BackgroundGradient containerClassName="col-span-1 grid" className="grid">
          <button className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3 hover:bg-white dark:hover:bg-gray-800">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Exportar</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Descargar datos</p>
            </div>
          </button>
        </BackgroundGradient>

        <BackgroundGradient containerClassName="col-span-1 grid" className="grid">
          <button className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3 hover:bg-white dark:hover:bg-gray-800">
            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Filtros avanzados</p>
            </div>
          </button>
        </BackgroundGradient>

        <BackgroundGradient containerClassName="col-span-1 grid" className="grid">
          <button 
            onClick={handleRefresh}
            className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3 hover:bg-white dark:hover:bg-gray-800"
          >
            <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Actualizar</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Recargar datos</p>
            </div>
          </button>
        </BackgroundGradient>
      </div>

      {/* Cases Table */}
      <BackgroundGradient containerClassName="grid" className="grid">
        <CasesTable cases={cases} onCaseSelect={handleCaseSelect} />
      </BackgroundGradient>

      {/* Case Detail Panel */}
      <CaseDetailPanel
        case_={selectedCase}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  )
}

export default MainCases