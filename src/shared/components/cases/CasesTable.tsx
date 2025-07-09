{filteredAndSortedCases.length > 0 ? (
  filteredAndSortedCases.slice(0, 100).map((case_) => {
    const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''

    return (
      <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-4 py-4">
          <div className="flex flex-col items-start space-y-1 text-left">
            {case_.code && (
              <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-1">
                {case_.code}
              </div>
            )}
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                case_.payment_status,
              )}`}
            >
              {case_.payment_status}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-left">
          {case_.created_at ? new Date(case_.created_at).toLocaleDateString('es-ES') : 'N/A'}
        </td>
        <td className="px-4 py-4">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {case_.full_name}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{case_.id_number}</span>
              {ageDisplay && (
                <>
                  <span>•</span>
                  <span>{ageDisplay}</span>
                </>
              )}
            </div>
          </div>
        </td>
        <td className="text-sm text-gray-900 dark:text-gray-100">
          <div className={`text-white text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1 ${
            case_.branch === 'STX' ? 'bg-[#0066cc]' : 
            case_.branch === 'PMG' ? 'bg-[#33cc33]' : 
            case_.branch === 'MCY' ? 'bg-[#ff9933]' : 
            case_.branch === 'CPC' ? 'bg-[#ff3333]' : 
            case_.branch === 'CNX' ? 'bg-[#9933cc]' : 
            'bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-gray-900 dark:text-gray-100'
          }`}>
            {case_.branch}
          </div>
        </td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
          {case_.exam_type}
        </td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
          {case_.treating_doctor}
        </td>
        <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${case_.total_amount.toLocaleString()}
          </div>
          {case_.remaining > 0 && (
            <div className="text-xs text-red-600 dark:text-red-400">
              Faltante: ${case_.remaining.toLocaleString()}
            </div>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="flex justify-center mx-5">
            <CaseActionsPopover case_={case_} />
          </div>
        </td>
      </tr>
    )
  })
) : (
  <tr>
    <td colSpan={8}>
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No se encontraron casos</p>
          <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    </td>
  </tr>
)}