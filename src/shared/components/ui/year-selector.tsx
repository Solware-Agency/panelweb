import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

interface YearSelectorProps {
  selectedYear: number
  onYearChange: (year: number) => void
  minYear?: number
  maxYear?: number
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 2
}) => {
  const handlePreviousYear = () => {
    if (selectedYear > minYear) {
      onYearChange(selectedYear - 1)
    }
  }

  const handleNextYear = () => {
    if (selectedYear < maxYear) {
      onYearChange(selectedYear + 1)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePreviousYear}
        disabled={selectedYear <= minYear}
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="px-3 py-1 min-w-[60px] text-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedYear}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextYear}
        disabled={selectedYear >= maxYear}
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}