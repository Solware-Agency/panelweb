import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Button } from '@shared/components/ui/button'
import { Form } from '@shared/components/ui/form'
import { useToast } from '@shared/hooks/use-toast'
import { formSchema, type FormValues } from '@features/form/lib/form-schema'
import { PatientDataSection } from './PatientDataSection'
import { ServiceSection } from './ServiceSection'
import { PaymentSection } from './PaymentSection'
import { CommentsSection } from './CommentsSection'
import { FilePlus2, Loader2 } from 'lucide-react'
import { useExchangeRate } from '@shared/hooks/useExchangeRate'
import { useResetForm } from '@shared/hooks/useResetForm'
import { insertMedicalRecord } from '@lib/supabase-service'

const getInitialFormValues = (): FormValues => ({
	fullName: '',
	idNumber: '',
	phone: '',
	age: 0,
	email: '',
	examType: '',
	origin: '',
	treatingDoctor: '',
	sampleType: '',
	numberOfSamples: 0,
	relationship: '',
	branch: '',
	date: new Date(),
	totalAmount: 0,
	payments: [{ method: '', amount: 0, reference: '' }],
	comments: '',
})

export function MedicalFormContainer() {
	const { toast } = useToast()
	const { data: exchangeRate, isLoading: isLoadingRate } = useExchangeRate()
	const [usdValue, setUsdValue] = useState('')
	const [vesValue, setVesValue] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: getInitialFormValues(),
	})
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'payments',
	})

	// Sync VES with USD input
	useEffect(() => {
		if (exchangeRate && usdValue) {
			const usd = parseFloat(usdValue)
			if (!isNaN(usd)) {
				setVesValue((usd * exchangeRate).toFixed(2))
			}
		} else {
			setVesValue('')
		}
	}, [usdValue, exchangeRate])

	useResetForm(form, getInitialFormValues, setUsdValue, setIsSubmitted, toast)

	async function onSubmit(data: FormValues) {
		setIsSubmitting(true)

		try {
			console.log('Enviando datos del formulario:', data)
			const { data: insertedRecord, error } = await insertMedicalRecord(data, exchangeRate)

			if (error) {
				console.error('Error al guardar en Supabase:', error)

				if (error.code === 'TABLE_NOT_EXISTS') {
					toast({
						title: '❌ Tabla no encontrada',
						description: 'La tabla de registros médicos no existe. Contacta al administrador del sistema.',
						variant: 'destructive',
					})
				} else {
					toast({
						title: '❌ Error al guardar',
						description: `Error: ${error.message || 'Hubo un problema al guardar el registro.'}`,
						variant: 'destructive',
					})
				}
				return
			}

			if (insertedRecord) {
				console.log('Registro guardado exitosamente:', insertedRecord)
				toast({
					title: '✅ Registro guardado exitosamente',
					description: `El registro médico ha sido guardado con ID: ${insertedRecord.id}`,
					className: 'bg-green-100 border-green-400 text-green-800',
				})
				setIsSubmitted(true)
			}
		} catch (error) {
			console.error('Error inesperado:', error)
			toast({
				title: '❌ Error inesperado',
				description: 'Ocurrió un error inesperado. Contacta al supervisor.',
				variant: 'destructive',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleNewRecord = () => {
		form.reset(getInitialFormValues())
		setUsdValue('')
		setIsSubmitted(false)
	}

	const inputStyles = 'transition-all duration-300 focus:border-primary focus:ring-primary'

	return (
		<div className="animate-fade-in">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<PatientDataSection control={form.control} inputStyles={inputStyles} />
					<ServiceSection control={form.control} inputStyles={inputStyles} />
					<PaymentSection
						control={form.control}
						errors={form.formState.errors}
						fields={fields}
						append={fields.length < 4 ? append : undefined}
						remove={remove}
						inputStyles={inputStyles}
						usdValue={usdValue}
						setUsdValue={setUsdValue}
						vesValue={vesValue}
						exchangeRate={exchangeRate}
						isLoadingRate={isLoadingRate}
					/>
					<CommentsSection control={form.control} inputStyles={inputStyles} />
					{isSubmitted ? (
						<Button
							type="button"
							onClick={handleNewRecord}
							size="lg"
							className="w-full font-bold text-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
						>
							<FilePlus2 />
							Nuevo Registro
						</Button>
					) : (
						<Button
							type="submit"
							size="lg"
							className="w-full font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Guardando...
								</>
							) : (
								'Enviar'
							)}
						</Button>
					)}
				</form>
			</Form>
		</div>
	)
}
