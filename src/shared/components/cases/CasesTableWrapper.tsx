import React, { useState } from 'react'
import CasesTable from './CasesTable'
import CasesTableDebug from './CasesTableDebug'
import { Button } from '@shared/components/ui/button'
import { Bug, Table } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import type { MedicalRecord } from '@lib/supabase-service'
import CaseDetailPanel from './CaseDetailPanel'

const CasesTableWrapper: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false)
  const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Query for medical records data
  const {
    data: casesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['medical-cases'],
    queryFn: () => getMedicalRecords(100, 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleCaseSelect = (case_: MedicalRecord) => {
    setSelectedCase(case_)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    // Delay clearing selected case to allow animation to complete
    setTimeout(() => setSelectedCase(null), 300)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebugger(!showDebugger)}
          className="flex items-center gap-2"
        >
          {showDebugger ? (
            <>
              <Table className="w-4 h-4" />
              Show Table
            </>
          ) : (
            <>
              <Bug className="w-4 h-4" />
              Debug Mode
            </>
          )}
        </Button>
      </div>

      {showDebugger ? (
        <CasesTableDebug />
      ) : (
        <CasesTable
          onCaseSelect={handleCaseSelect}
          cases={casesData?.data || []}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
      )}

      {/* Case Detail Panel */}
      <CaseDetailPanel case_={selectedCase} isOpen={isPanelOpen} onClose={handlePanelClose} />
    </div>
  )
}

export default CasesTableWrapper