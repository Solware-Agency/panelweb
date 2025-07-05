import React from 'react'
import PatientsList from './PatientsList'
import { Card } from '@shared/components/ui/card'

const PatientsPage: React.FC = () => {
	return (
		<div className="p-3 sm:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
					Pacientes
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
					Gestiona la información de los pacientes registrados en el sistema
				</p>
			</div>
			
			<PatientsList />
		</div>
	)
}

export default PatientsPage