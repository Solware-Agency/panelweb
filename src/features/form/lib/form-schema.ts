import { z } from 'zod'

// --- Validation Schema ---
export const paymentSchema = z.object({
	method: z.string({ required_error: 'El método de pago es requerido.' }).min(1, 'El método de pago es requerido.'),
	amount: z.coerce
		.number({ invalid_type_error: 'El monto debe ser un número' })
		.min(0, 'El monto debe ser un número positivo o cero.'),
	reference: z.string().min(1, 'La referencia es requerida'),
})

export const formSchema = z.object({
	fullName: z
		.string()
		.min(1, 'Nombre completo es requerido')
		.regex(/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/, 'Nombre solo debe contener letras y espacios'),
	idNumber: z
		.string()
		.min(1, 'La cédula es requerida')
		.regex(/^[0-9]+$/, 'Cédula solo debe contener números'),
	phone: z
		.string()
		.min(1, 'El número de teléfono es requerido')
		.max(15, 'El número de teléfono no puede tener más de 15 caracteres')
		.regex(/^[0-9-+\s()]+$/, 'El teléfono solo puede contener números, guiones, espacios, paréntesis y el símbolo +'),
	dateOfBirth: z.date({ 
		required_error: 'La fecha de nacimiento es requerida.',
		invalid_type_error: 'Fecha de nacimiento inválida.'
	}).refine((date) => {
		const today = new Date()
		const maxAge = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate())
		return date <= today && date >= maxAge
	}, 'La fecha de nacimiento debe ser válida (no futura y no mayor a 150 años)'),
	email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
	registrationDate: z.date({ required_error: 'La fecha de registro es requerida.' }),
	examType: z.string().min(1, 'El tipo de exámen es requerido'),
	origin: z
		.string()
		.min(1, 'El origen es requerido')
		.regex(/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/, 'Procedencia solo debe contener letras y espacios'),
	treatingDoctor: z
		.string()
		.min(1, 'El médico tratante es requerido')
		.regex(/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/, 'Médico tratante solo debe contener letras y espacios'),
	sampleType: z
		.string()
		.min(1, 'El tipo de muestra es requerido')
		.regex(/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/, 'Tipo de muestra solo debe contener letras y espacios'),
	numberOfSamples: z.coerce
		.number({ invalid_type_error: 'El número de muestras es requerido' })
		.int()
		.positive('El número debe ser positivo')
		.min(1, 'El número de muestras es requerido'),
	relationship: z.string().optional(),
	branch: z.string().min(1, 'La sede es requerida'),
	totalAmount: z.coerce
		.number({ invalid_type_error: 'El monto total es requerido' })
		.positive('El monto total debe ser positivo'),
	payments: z
		.array(paymentSchema)
		.min(1, 'Se requiere al menos un método de pago.')
		.max(4, 'Puedes agregar hasta 4 métodos de pago.'),
	comments: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>