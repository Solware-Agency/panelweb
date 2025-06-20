import type { MedicalCase } from '@/types/case'

const estudios = [
	'Resonancia Magnética',
	'Tomografía Computarizada',
	'Radiografía',
	'Ecografía',
	'Mamografía',
	'Electrocardiograma',
	'Análisis de Sangre',
	'Biopsia',
	'Endoscopia',
	'Colonoscopia',
]

const sedes = ['Sede Central', 'Sede Norte', 'Sede Sur', 'Sede Este', 'Sede Oeste', 'Clínica Especializada']

const medicos = [
	'Dr. Carlos Rodríguez',
	'Dra. María González',
	'Dr. José Martínez',
	'Dra. Ana López',
	'Dr. Luis Hernández',
	'Dra. Carmen Díaz',
	'Dr. Roberto Silva',
	'Dra. Patricia Morales',
]

const procedencias = ['Consulta Externa', 'Emergencia', 'Hospitalización', 'Referencia Médica', 'Chequeo Preventivo']

const muestras = ['Sangre', 'Orina', 'Tejido', 'Líquido Cefalorraquídeo', 'Biopsia', 'Hisopado', 'Saliva']

const formasPago = [
	'Efectivo',
	'Tarjeta de Crédito',
	'Tarjeta de Débito',
	'Transferencia Bancaria',
	'Seguro Médico',
	'Pago Móvil',
]

function generateRandomName(): { nombre: string; apellido: string; nombreCompleto: string } {
	const nombres = [
		'Carlos',
		'María',
		'José',
		'Ana',
		'Luis',
		'Carmen',
		'Roberto',
		'Patricia',
		'Miguel',
		'Laura',
		'David',
		'Sofia',
		'Pedro',
		'Isabel',
		'Juan',
		'Elena',
	]
	const apellidos = [
		'García',
		'Rodríguez',
		'Martínez',
		'López',
		'Hernández',
		'González',
		'Pérez',
		'Sánchez',
		'Ramírez',
		'Torres',
		'Flores',
		'Rivera',
		'Gómez',
		'Díaz',
		'Cruz',
		'Morales',
	]

	const nombre = nombres[Math.floor(Math.random() * nombres.length)]
	const apellido = apellidos[Math.floor(Math.random() * apellidos.length)]

	return { nombre, apellido, nombreCompleto: `${nombre} ${apellido}` }
}

function generateRandomCedula(): string {
	const prefix = ['V', 'E'][Math.floor(Math.random() * 2)]
	const number = Math.floor(Math.random() * 90000000) + 10000000
	return `${prefix}-${number}`
}

function generateRandomPhone(): string {
	const prefixes = ['0412', '0414', '0416', '0424', '0426']
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
	const number = Math.floor(Math.random() * 9000000) + 1000000
	return `${prefix}-${number}`
}

function generateRandomEmail(nombre: string, apellido: string): string {
	const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
	const domain = domains[Math.floor(Math.random() * domains.length)]
	return `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${domain}`
}

function generateRandomDate(): string {
	const start = new Date(2024, 0, 1)
	const end = new Date()
	const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	return date.toISOString().split('T')[0]
}

function generateRandomCode(): string {
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const numbers = '0123456789'
	let code = ''

	// 2 letters + 4 numbers
	for (let i = 0; i < 2; i++) {
		code += letters.charAt(Math.floor(Math.random() * letters.length))
	}
	for (let i = 0; i < 4; i++) {
		code += numbers.charAt(Math.floor(Math.random() * numbers.length))
	}

	return code
}

export function generateMockCases(count: number = 50): MedicalCase[] {
	const cases: MedicalCase[] = []

	for (let i = 0; i < count; i++) {
		const { nombre, apellido, nombreCompleto } = generateRandomName()
		const montoTotal = Math.floor(Math.random() * 5000) + 500
		const montoFaltante = Math.random() > 0.7 ? Math.floor(Math.random() * montoTotal * 0.5) : 0

		const case_: MedicalCase = {
			estatus: ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'][
				Math.floor(Math.random() * 4)
			] as MedicalCase['estatus'],
			codigo: generateRandomCode(),
			estatusPagoInforme: ['Pendiente', 'Pagado', 'Enviado', 'Completado'][
				Math.floor(Math.random() * 4)
			] as MedicalCase['estatusPagoInforme'],
			fechaIngreso: generateRandomDate(),

			nombre,
			apellido,
			nombreCompleto,
			cedula: generateRandomCedula(),
			edad: Math.floor(Math.random() * 80) + 18,
			telefono: generateRandomPhone(),
			email: generateRandomEmail(nombre, apellido),

			sedes: sedes[Math.floor(Math.random() * sedes.length)],
			estudio: estudios[Math.floor(Math.random() * estudios.length)],
			procedencia: procedencias[Math.floor(Math.random() * procedencias.length)],
			medicoTratante: medicos[Math.floor(Math.random() * medicos.length)],
			muestra: muestras[Math.floor(Math.random() * muestras.length)],
			cantidadMuestras: Math.floor(Math.random() * 5) + 1,

			montoTotal,
			montoFaltante,
			formaPago1: formasPago[Math.floor(Math.random() * formasPago.length)],
			monto1: Math.floor(montoTotal * 0.6),
			referenciaPago1: `REF-${Math.floor(Math.random() * 1000000)}`,

			...(Math.random() > 0.5 && {
				formaPago2: formasPago[Math.floor(Math.random() * formasPago.length)],
				monto2: Math.floor(montoTotal * 0.4),
				referenciaPago2: `REF-${Math.floor(Math.random() * 1000000)}`,
			}),

			conversion1: Math.random() * 50 + 1,
			conversion2: Math.random() * 50 + 1,
			verificacion: Math.random() > 0.3,
			tasa: Math.random() * 50 + 1,

			comentarios: Math.random() > 0.5 ? 'Caso requiere seguimiento especial' : undefined,
			relacion: Math.random() > 0.7 ? 'Familiar directo' : undefined,
			encabezados: `Encabezado-${Math.floor(Math.random() * 100)}`,
			informeQR: `QR-${Math.floor(Math.random() * 1000000)}`,
			enviado: Math.random() > 0.4,
		}

		cases.push(case_)
	}

	return cases
}
