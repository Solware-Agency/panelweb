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
import { FilePlus2, Loader2, Trash2 } from 'lucide-react'
import { useExchangeRate } from '@shared/hooks/useExchangeRate'
import { useResetForm } from '@shared/hooks/useResetForm'
import { insertMedicalRecord } from '@lib/supabase-service'

const getInitialFormValues = (): FormValues => ({
	fullName: '',
	idNumber: '',
	phone: '',
	dateOfBirth: new Date(2000, 0, 1), // Default to Jan 1, 2000
	email: '',
	examType: '',
	origin: '',
	treatingDoctor: '',
	sampleType: '',
	numberOfSamples: 1,
	relationship: '',
	branch: '',
	registrationDate: new Date(),
	totalAmount: 0,
	payments: [],
	comments: '',
})

export function MedicalFormContainer() {
	const { toast } = useToast()
	const { data: exchangeRate, isLoading: isLoadingRate } = useExchangeRate()
	const [usdValue, setUsdValue] = useState('')
	const [vesValue, setVesValue] = useState('')
	const [vesInputValue, setVesInputValue] = useState('')
	const [usdFromVes, setUsdFromVes] = useState('')
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

	// Sync USD with VES input
	useEffect(() => {
		if (exchangeRate && vesInputValue && exchangeRate > 0) {
			const ves = parseFloat(vesInputValue)
			if (!isNaN(ves)) {
				setUsdFromVes((ves / exchangeRate).toFixed(2))
			}
		} else {
			setUsdFromVes('')
		}
	}, [vesInputValue, exchangeRate])

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
					description: `El registro médico ha sido guardado con código: ${insertedRecord.code || insertedRecord.id}`,
					className: 'bg-green-100 border-green-400 text-green-800',
				})
				setIsSubmitted(true)
				
				// Clear form after successful submission
				form.reset(getInitialFormValues())
				setUsdValue('')
				setVesInputValue('')
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
		setVesInputValue('')
		setIsSubmitted(false)
	}

	const handleClearForm = () => {
		form.reset(getInitialFormValues())
		setUsdValue('')
		setVesInputValue('')
		setIsSubmitted(false)
		toast({
			title: '🧹 Formulario Limpio',
			description: 'Todos los campos han sido reiniciados.',
		})
	}

	const inputStyles = 'transition-all duration-300 focus:border-primary focus:ring-primary'

	return (
		<div className="animate-fade-in">
			<div className="flex justify-end mb-4">
				<Button 
					type="button" 
					onClick={handleClearForm}
					variant="outline"
					className="flex items-center gap-2"
				>
					<Trash2 className="h-4 w-4" />
					Limpiar
				</Button>
			</div>
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
						vesInputValue={vesInputValue}
						setVesInputValue={setVesInputValue}
						usdFromVes={usdFromVes}
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