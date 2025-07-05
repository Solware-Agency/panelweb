import React from 'react'
import PatientsList from './PatientsList'

const PatientsPage: React.FC = () => {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Pacientes
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Gestiona la información de los pacientes
				</p>
			</div>
			<PatientsList />
		</div>
	)
}

export default PatientsPage