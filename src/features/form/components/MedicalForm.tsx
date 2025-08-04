import { MedicalFormContainer } from './MedicalFormContainer'
import { forwardRef, useImperativeHandle } from 'react'

export interface MedicalFormRef {
	clearForm: () => void
}

export const MedicalForm = forwardRef<MedicalFormRef>((props, ref) => {
	useImperativeHandle(
		ref,
		() => ({
			clearForm: () => {
				// Call the clear function in MedicalFormContainer
				// We'll use a custom event to communicate
				window.dispatchEvent(new CustomEvent('clearForm'))
			},
		}),
		[],
	)

	return <MedicalFormContainer />
})
