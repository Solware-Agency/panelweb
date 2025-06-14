export interface MedicalCase {
  // Main identification
  estatus: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado'
  codigo: string
  estatusPagoInforme: 'Pendiente' | 'Pagado' | 'Enviado' | 'Completado'
  fechaIngreso: string
  
  // Patient information
  nombre: string
  apellido: string
  nombreCompleto: string
  cedula: string
  edad: number
  telefono: string
  email: string
  
  // Medical information
  sedes: string
  estudio: string
  procedencia: string
  medicoTratante: string
  muestra: string
  cantidadMuestras: number
  
  // Financial information
  montoTotal: number
  montoFaltante: number
  formaPago1?: string
  monto1?: number
  referenciaPago1?: string
  formaPago2?: string
  monto2?: number
  referenciaPago2?: string
  formaPago3?: string
  monto3?: number
  referenciaPago3?: string
  formaPago4?: string
  monto4?: number
  referenciaPago4?: string
  
  // Exchange rates and verification
  conversion1?: number
  conversion2?: number
  conversion3?: number
  conversion4?: number
  verificacion: boolean
  tasa: number
  
  // Additional information
  comentarios?: string
  relacion?: string
  encabezados?: string
  informeQR?: string
  enviado: boolean
}

export interface CaseTableColumn {
  key: keyof MedicalCase
  label: string
  sortable?: boolean
  width?: string
}