import React from 'react'
import { Users } from 'lucide-react'

const PatientsList: React.FC = () => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
				<div className="text-center">
					<Users className="w-12 h-12 mx-auto mb-4" />
					<h3 className="text-lg font-medium mb-2">Lista de Pacientes</h3>
					<p className="text-sm">La funcionalidad de pacientes estará disponible próximamente</p>
				</div>
			</div>
		</div>
	)
}

export default PatientsList