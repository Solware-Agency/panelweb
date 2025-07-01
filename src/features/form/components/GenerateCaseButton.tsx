import React, { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import GenerateCaseModal from './GenerateCaseModal'

const GenerateCaseButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <FileText className="mr-2 h-4 w-4" />
        Generar caso
      </Button>

      <GenerateCaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default GenerateCaseButton