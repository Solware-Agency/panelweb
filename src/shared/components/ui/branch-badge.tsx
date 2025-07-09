import { cn } from "@shared/lib/cn"

interface BranchBadgeProps {
  branch: string
  className?: string
}

export function BranchBadge({ branch, className }: BranchBadgeProps) {
  const getBranchColor = (branchCode: string) => {
    switch (branchCode) {
      case 'STX':
        return 'bg-[#0066cc]' // Blue
      case 'PMG':
        return 'bg-[#33cc33]' // Green
      case 'MCY':
        return 'bg-[#ff9933]' // Orange
      case 'CPC':
        return 'bg-[#ff3333]' // Red
      case 'CNX':
        return 'bg-[#9933cc]' // Purple
      default:
        return 'bg-gray-200 dark:bg-gray-900/60 text-gray-900 dark:text-gray-100'
    }
  }

  return (
    <div 
      className={cn(
        "text-white text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1",
        getBranchColor(branch),
        className
      )}
    >
      {branch}
    </div>
  )
}