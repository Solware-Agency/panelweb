import { useRef } from 'react'
import { MedicalFormContainer } from './MedicalFormContainer'

export function MedicalForm() {
	const patientSectionRef = useRef<HTMLDivElement>(null)
	const serviceSectionRef = useRef<HTMLDivElement>(null)
	const paymentSectionRef = useRef<HTMLDivElement>(null)
	const commentsSectionRef = useRef<HTMLDivElement>(null)
	
	return (
		<div className="space-y-6 sm:space-y-8">
			<div ref={patientSectionRef} id="patient-section">
				<MedicalFormContainer 
					patientSectionRef={patientSectionRef}
					serviceSectionRef={serviceSectionRef}
					paymentSectionRef={paymentSectionRef}
					commentsSectionRef={commentsSectionRef}
				/>
			</div>
		</div>
	)
}
