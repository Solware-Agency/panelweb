import React, { useState, useMemo } from 'react'
import {
	ChevronUp,
	ChevronDown,
	Search,
	Filter,
	Eye,
	CalendarIcon,
	User,
	Stethoscope,
	CreditCard,
	FileText,
	Download,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay, deleteMedicalRecord, updateMedicalRecordWithLog } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useAuth } from '@app/providers/AuthContext'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { Calendar } from '@shared/components/ui/calendar'
import { cn } from '@shared/lib/cn'
import GenerateBiopsyModal from './GenerateBiopsyModal'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import logoBase64 from '@assets/img/logo_conspat_base64.txt?raw'

interface CasesTableProps {
	onCaseSelect: (case_: MedicalRecord) => void
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
}

type SortField = 'id' | 'created_at' | 'full_name' | 'date_of_birth' | 'total_amount' | 'code'
type SortDirection = 'asc' | 'desc'

const CasesTable: React.FC<CasesTableProps> = ({ 
	onCaseSelect, 
	cases, 
	isLoading, 
	error, 
	refetch,
	isFullscreen,
	setIsFullscreen 
}) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [branchFilter, setBranchFilter] = useState<string>('all')
	const [examTypeFilter, setExamTypeFilter] = useState<string>('all')
	const [sortField, setSortField] = useState<SortField>('created_at')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [rowLimit, setRowLimit] = useState<number>(20)
	const [selectedCaseForGenerate, setSelectedCaseForGenerate] = useState<MedicalRecord | null>(null)
	const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
	const [isDownloading, setIsDownloading] = useState<string | null>(null)

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Completado':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'En Proceso':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			case 'Pendiente':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			case 'Cancelado':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
			default:
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
		}
	}

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	const handleGenerateCase = (case_: MedicalRecord) => {
		// Check if this is a biopsy case
		if (case_.exam_type?.toLowerCase() !== 'biopsia') {
			toast({
				title: '❌ Tipo de examen incorrecto',
				description: 'La generación de casos solo está disponible para biopsias.',
				variant: 'destructive',
			})
			return
		}
		
		setSelectedCaseForGenerate(case_)
		setIsGenerateModalOpen(true)
	}

	const handleDownloadCase = async (case_: MedicalRecord) => {
		// Check if this case has a diagnosis
		if (!case_.diagnostico) {
			toast({
				title: '❌ Sin diagnóstico',
				description: 'Este caso no tiene un diagnóstico. Primero debe generar el caso.',
				variant: 'destructive',
			})
			return
		}

		setIsDownloading(case_.id)
		try {
			// Create a new PDF document
			const doc = new jsPDF()
			
			// Clean the base64 string by removing all whitespace
			const cleanedBase64 = logoBase64.replace(/\s/g, '')
			const fullDataUrl = `data:image/png;base64,${cleanedBase64}`
			
			try {
				// Add the logo to the PDF
				doc.addImage(fullDataUrl, 'PNG', 70, 10, 70, 25)
			} catch (error) {
				console.error('Error adding logo to PDF:', error)
				// Continue with PDF generation even if logo fails
			}
			
			// Add header
			doc.setFontSize(18)
			doc.setTextColor(33, 33, 33)
			doc.text('INFORME DE BIOPSIA', 105, 45, { align: 'center' })
			
			// Add patient information
			doc.setFontSize(14)
			doc.setFont('helvetica', 'bold')
			doc.text('Información del Paciente', 14, 55)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(10)
			
			// Create a table for patient info
			const patientData = [
				['Nombre:', case_.full_name],
				['Cédula:', case_.id_number],
				['Fecha de Nacimiento:', case_.date_of_birth ? format(parseISO(case_.date_of_birth), 'dd/MM/yyyy', { locale: es }) : 'N/A'],
				['Edad:', case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : 'N/A'],
				['Teléfono:', case_.phone],
				['Email:', case_.email || 'N/A'],
			]
			
			doc.autoTable({
				startY: 60,
				head: [],
				body: patientData,
				theme: 'plain',
				styles: {
					cellPadding: 2,
					fontSize: 10,
				},
				columnStyles: {
					0: { cellWidth: 40, fontStyle: 'bold' },
					1: { cellWidth: 100 },
				},
			})
			
			// Add case details
			doc.setFontSize(14)
			doc.setFont('helvetica', 'bold')
			doc.text('Información del Caso', 14, doc.autoTable.previous.finalY + 10)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(10)
			
			// Create a table for case info
			const caseData = [
				['Código:', case_.code || 'N/A'],
				['Fecha:', format(new Date(case_.date), 'dd/MM/yyyy', { locale: es })],
				['Tipo de Examen:', case_.exam_type],
				['Médico Tratante:', case_.treating_doctor],
				['Procedencia:', case_.origin],
				['Sede:', case_.branch],
			]
			
			doc.autoTable({
				startY: doc.autoTable.previous.finalY + 15,
				head: [],
				body: caseData,
				theme: 'plain',
				styles: {
					cellPadding: 2,
					fontSize: 10,
				},
				columnStyles: {
					0: { cellWidth: 40, fontStyle: 'bold' },
					1: { cellWidth: 100 },
				},
			})
			
			// Add biopsy information
			doc.setFontSize(14)
			doc.setFont('helvetica', 'bold')
			doc.text('Informe de Biopsia', 14, doc.autoTable.previous.finalY + 10)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(10)
			
			// Material Remitido
			doc.setFontSize(12)
			doc.setFont('helvetica', 'bold')
			doc.text('Material Remitido:', 14, doc.autoTable.previous.finalY + 15)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(10)
			
			const splitMaterial = doc.splitTextToSize(case_.material_remitido || 'N/A', 180)
			doc.text(splitMaterial, 14, doc.autoTable.previous.finalY + 20)
			
			// Información Clínica
			doc.setFontSize(12)
			doc.setFont('helvetica', 'bold')
			doc.text('Información Clínica:', 14, doc.getTextDimensions(splitMaterial).h + doc.autoTable.previous.finalY + 25)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(10)
			
			const splitClinica = doc.splitTextToSize(case_.informacion_clinica || 'N/A', 180)
			doc.text(splitClinica, 14, doc.getTextDimensions(splitMaterial).h + doc.autoTable.previous.finalY + 30)
			
			// Descripción Macroscópica
			const clinicaY = doc.getTextDimensions(splitClinica).h + doc.getTextDimensions(splitMaterial).h + doc.autoTable.previous.finalY + 35
			
			// Check if we need a new page
			if (clinicaY > 250) {
				doc.addPage()
				doc.setFontSize(12)
				doc.setFont('helvetica', 'bold')
				doc.text('Descripción Macroscópica:', 14, 20)
				doc.setFont('helvetica', 'normal')
				doc.setFontSize(10)
				
				const splitMacro = doc.splitTextToSize(case_.descripcion_macroscopica || 'N/A', 180)
				doc.text(splitMacro, 14, 25)
				
				// Diagnóstico
				doc.setFontSize(12)
				doc.setFont('helvetica', 'bold')
				doc.text('Diagnóstico:', 14, doc.getTextDimensions(splitMacro).h + 30)
				doc.setFont('helvetica', 'normal')
				doc.setFontSize(10)
				
				const splitDiag = doc.splitTextToSize(case_.diagnostico || 'N/A', 180)
				doc.text(splitDiag, 14, doc.getTextDimensions(splitMacro).h + 35)
				
				// Comentario (if exists)
				if (case_.comentario) {
					const diagY = doc.getTextDimensions(splitDiag).h + doc.getTextDimensions(splitMacro).h + 40
					
					doc.setFontSize(12)
					doc.setFont('helvetica', 'bold')
					doc.text('Comentario:', 14, diagY)
					doc.setFont('helvetica', 'normal')
					doc.setFontSize(10)
					
					const splitComment = doc.splitTextToSize(case_.comentario, 180)
					doc.text(splitComment, 14, diagY + 5)
				}
			} else {
				doc.setFontSize(12)
				doc.setFont('helvetica', 'bold')
				doc.text('Descripción Macroscópica:', 14, clinicaY)
				doc.setFont('helvetica', 'normal')
				doc.setFontSize(10)
				
				const splitMacro = doc.splitTextToSize(case_.descripcion_macroscopica || 'N/A', 180)
				doc.text(splitMacro, 14, clinicaY + 5)
				
				// Diagnóstico
				const macroY = doc.getTextDimensions(splitMacro).h + clinicaY + 10
				
				doc.setFontSize(12)
				doc.setFont('helvetica', 'bold')
				doc.text('Diagnóstico:', 14, macroY)
				doc.setFont('helvetica', 'normal')
				doc.setFontSize(10)
				
				const splitDiag = doc.splitTextToSize(case_.diagnostico || 'N/A', 180)
				doc.text(splitDiag, 14, macroY + 5)
				
				// Comentario (if exists)
				if (case_.comentario) {
					const diagY = doc.getTextDimensions(splitDiag).h + macroY + 10
					
					// Check if we need a new page
					if (diagY > 250) {
						doc.addPage()
						doc.setFontSize(12)
						doc.setFont('helvetica', 'bold')
						doc.text('Comentario:', 14, 20)
						doc.setFont('helvetica', 'normal')
						doc.setFontSize(10)
						
						const splitComment = doc.splitTextToSize(case_.comentario, 180)
						doc.text(splitComment, 14, 25)
					} else {
						doc.setFontSize(12)
						doc.setFont('helvetica', 'bold')
						doc.text('Comentario:', 14, diagY)
						doc.setFont('helvetica', 'normal')
						doc.setFontSize(10)
						
						const splitComment = doc.splitTextToSize(case_.comentario, 180)
						doc.text(splitComment, 14, diagY + 5)
					}
				}
			}
			
			// Add footer
			const pageCount = doc.getNumberOfPages()
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i)
				
				// Add the custom footer text
				doc.setFontSize(8)
				doc.setTextColor(100, 100, 100)
				
				// First line of footer
				doc.text(
					'DIRECCIÓN:',
					14,
					doc.internal.pageSize.getHeight() - 30
				)
				
				// Second line - addresses
				doc.text(
					'VALLES DEL TUY: Edificio Multioficinas Conex / CARACAS: Policlínica Méndez Gimón – Clínica Sanatrix – Torre Centro Caracas / MARACAY: Centro Profesional Plaza',
					14,
					doc.internal.pageSize.getHeight() - 25
				)
				
				// Third line - contact info
				doc.text(
					'CONTACTO: (0212) 889822 / (0414) 4861289 / (0424) 1425562',
					14,
					doc.internal.pageSize.getHeight() - 20
				)
				
				// Fourth line - email
				doc.text(
					'Resultados@conspat.com',
					14,
					doc.internal.pageSize.getHeight() - 15
				)
				
				// Page number and generation date at the bottom
				doc.text(
					`Página ${i} de ${pageCount} - Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
					doc.internal.pageSize.getWidth() / 2,
					doc.internal.pageSize.getHeight() - 10,
					{ align: 'center' }
				)
			}
			
			// Save the PDF
			const fileName = `biopsia_${case_.code || case_.id}_${case_.full_name.replace(/\s+/g, '_')}.pdf`
			doc.save(fileName)
			
			toast({
				title: '✅ PDF generado exitosamente',
				description: `El informe ha sido descargado como ${fileName}`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast({
				title: '❌ Error al generar PDF',
				description: 'Hubo un problema al generar el PDF. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsDownloading(null)
		}
	}

	const filteredAndSortedCases = useMemo(() => {
		if (!cases || !Array.isArray(cases)) {
			console.warn('Cases is not an array:', cases)
			return []
		}

		let filtered = cases.filter((case_) => {
			// Skip if case_ is null or undefined
			if (!case_) return false

			const matchesSearch =
				(case_.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
				(case_.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
				(case_.id_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
				(case_.exam_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
				(case_.treating_doctor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
				(case_.branch?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
				(case_.code && case_.code.toLowerCase().includes(searchTerm.toLowerCase()))

			// Updated filter logic to handle only "Completado" and "Incompleto"
			let matchesStatus = true
			if (statusFilter === 'Completado') {
				matchesStatus = case_.payment_status === 'Completado'
			} else if (statusFilter === 'Incompleto') {
				// "Incompleto" includes all non-completed statuses
				matchesStatus = case_.payment_status !== 'Completado'
			}
			// If statusFilter is 'all', matchesStatus remains true

			// Branch filter
			const matchesBranch = branchFilter === 'all' || case_.branch === branchFilter

			// Exam type filter
			const matchesExamType = examTypeFilter === 'all' || case_.exam_type === examTypeFilter

			return matchesSearch && matchesStatus && matchesBranch && matchesExamType
		})

		filtered.sort((a, b) => {
			let aValue: any = a[sortField]
			let bValue: any = b[sortField]

			if (sortField === 'created_at' || sortField === 'date_of_birth') {
				aValue = new Date(aValue as string).getTime()
				bValue = new Date(bValue as string).getTime()
			}

			if (typeof aValue === 'string') {
				aValue = aValue.toLowerCase()
				bValue = (bValue as string).toLowerCase()
			}

			if (sortDirection === 'asc') {
				return aValue > bValue ? 1 : -1
			} else {
				return aValue < bValue ? 1 : -1
			}
		})

		// Apply row limit
		if (rowLimit > 0) {
			return filtered.slice(0, rowLimit)
		}

		return filtered
	}, [cases, searchTerm, statusFilter, branchFilter, examTypeFilter, sortField, sortDirection, rowLimit])

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) {
			return <ChevronUp className="w-4 h-4 text-gray-400" />
		}
		return sortDirection === 'asc' ? (
			<ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
		) : (
			<ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
		)
	}

	// Mobile Card Component
	const CaseCard = ({ case_ }: { case_: MedicalRecord }) => {
		const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
		const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
		const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

		return (
			<div className="bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
				{/* Header with status and code */}
				<div className="flex items-center justify-between mb-3">
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
							case_.payment_status,
						)}`}
					>
						{case_.payment_status}
					</span>
					<div className="flex items-center gap-2">
						{case_.code && (
							<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
								{case_.code}
							</span>
						)}
					</div>
				</div>

				{/* Patient info */}
				<div className="flex items-center gap-2 mb-2">
					<User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
					<div>
						<p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{case_.full_name}</p>
						<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
							<span>{case_.id_number}</span>
							{ageDisplay && (
								<>
									<span>•</span>
									<span>{ageDisplay}</span>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Medical info */}
				<div className="flex items-center gap-2 mb-2">
					<Stethoscope className="w-4 h-4 text-green-600 dark:text-green-400" />
					<div>
						<p className="text-sm text-gray-900 dark:text-gray-100">{case_.exam_type}</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">{case_.treating_doctor}</p>
					</div>
				</div>

				{/* Date and amount */}
				<div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-1">
						<CalendarIcon className="w-3 h-3 text-gray-400" />
						<span className="text-xs text-gray-500 dark:text-gray-400">
							{case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<CreditCard className="w-3 h-3 text-gray-400" />
						<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
							${case_.total_amount.toLocaleString()}
						</span>
					</div>
				</div>

				{case_.remaining > 0 && (
					<div className="mt-2 text-xs text-red-600 dark:text-red-400">
						Faltante: ${case_.remaining.toLocaleString()}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex gap-1 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
					<button
						onClick={() => onCaseSelect(case_)}
						className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
					>
						<Eye className="w-3 h-3" />
						Ver
					</button>
					<button
						onClick={() => handleGenerateCase(case_)}
						className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium ${
							isBiopsyCase 
								? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
								: "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed"
						} rounded-lg transition-colors`}
						disabled={!isBiopsyCase}
					>
						<FileText className="w-3 h-3" />
						Generar
					</button>
					<button
						onClick={() => handleDownloadCase(case_)}
						className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium ${
							hasDownloadableContent 
								? "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
								: "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed"
						} rounded-lg transition-colors`}
						disabled={!hasDownloadableContent || isDownloading === case_.id}
					>
						{isDownloading === case_.id ? (
							<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
						) : (
							<Download className="w-3 h-3" />
						)}
						Descargar
					</button>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full">
				<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-3">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
							<span className="text-lg text-gray-700 dark:text-gray-300">Cargando casos...</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full">
				<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="text-center py-12">
						<div className="text-red-500 dark:text-red-400">
							<p className="text-lg font-medium">Error al cargar los casos</p>
							<p className="text-sm mt-2">Verifica tu conexión a internet o contacta al administrador</p>
							<pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 mt-2 rounded overflow-auto max-w-full">
								{JSON.stringify(error, null, 2)}
							</pre>
							<button
								onClick={() => refetch()}
								className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								Reintentar
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isFullscreen) {
		return (
			<div className="fixed inset-0 z-[999999] bg-white dark:bg-background h-screen flex flex-col">
				{/* Fixed Header with Controls */}
				<div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-background">
					<div className="flex flex-wrap items-center gap-4">
						{/* Search and Filters Row */}
						<div className="flex flex-col sm:flex-row gap-4 flex-1">
							{/* Search - Acortada */}
							<div className="w-full sm:max-w-md relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar por nombre, código, cédula, estudio o médico..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								/>
							</div>

							{/* Status Filter - Updated with only Completado and Incompleto */}
							<div className="flex items-center gap-2">
								<Filter className="size-4 text-gray-400 mr-2" />
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estatus</option>
									<option value="Completado">Completado</option>
									<option value="Incompleto">Incompleto</option>
								</select>
							</div>

							{/* Branch Filter - Only show if user doesn't have assigned branch */}
							<div className="flex items-center gap-2">
								<select
									value={branchFilter}
									onChange={(e) => setBranchFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todas las sedes</option>
									<option value="PMG">PMG</option>
									<option value="CPC">CPC</option>
									<option value="CNX">CNX</option>
									<option value="STX">STX</option>
									<option value="MCY">MCY</option>
								</select>
							</div>

							{/* Exam Type Filter */}
							<div className="flex items-center gap-2">
								<select
									value={examTypeFilter}
									onChange={(e) => setExamTypeFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estudios</option>
									<option value="inmunohistoquimica">Inmunohistoquímica</option>
									<option value="biopsia">Biopsia</option>
									<option value="citologia">Citología</option>
								</select>
							</div>
						</div>

						{/* Row Limit Selector */}
						<div className="flex items-center gap-2">
							<label htmlFor="rowLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Mostrar:
							</label>
							<select
								id="rowLimit"
								value={rowLimit}
								onChange={(e) => setRowLimit(Number(e.target.value))}
								className="px-3 py-1 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
							>
								<option value={5}>Últimos 5 casos</option>
								<option value={10}>Últimos 10 casos</option>
								<option value={20}>Últimos 20 casos</option>
								<option value={50}>Últimos 50 casos</option>
								<option value={0}>Todos los casos</option>
							</select>
						</div>

						{/* Results count */}
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Mostrando {filteredAndSortedCases.length} de{' '}
							{
								cases.filter((case_) => {
									if (!case_) return false;
									
									const matchesSearch =
										(case_.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
										(case_.id_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.exam_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.treating_doctor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.branch?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.code && case_.code.toLowerCase().includes(searchTerm.toLowerCase()))

									let matchesStatus = true
									if (statusFilter === 'Completado') {
										matchesStatus = case_.payment_status === 'Completado'
									} else if (statusFilter === 'Incompleto') {
										matchesStatus = case_.payment_status !== 'Completado'
									}

									const matchesBranch = branchFilter === 'all' || case_.branch === branchFilter
									const matchesExamType = examTypeFilter === 'all' || case_.exam_type === examTypeFilter

									return matchesSearch && matchesStatus && matchesBranch && matchesExamType
								}).length
							}{' '}
							casos
						</div>

						{/* Close button */}
						<button
							onClick={() => setIsFullscreen(false)}
							className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-sm border px-3 py-1 rounded-md"
						>
							Cerrar ✕
						</button>
					</div>
				</div>

				{/* Scrollable Content Area */}
				<div className="flex-1 overflow-hidden">
					{/* Mobile View - Cards */}
					<div className="block lg:hidden h-full overflow-y-auto">
						<div className="p-4 space-y-4">
							{filteredAndSortedCases.map((case_) => (
								<CaseCard key={case_.id} case_={case_} />
							))}

							{filteredAndSortedCases.length === 0 && (
								<div className="text-center py-12">
									<div className="text-gray-500 dark:text-gray-400">
										<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p className="text-lg font-medium">No se encontraron casos</p>
										<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Desktop View - Table */}
					<div className="hidden lg:block h-full overflow-y-auto">
						<table className="w-full">
							<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-50">
								<tr>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('code')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
										>
											Código / Estatus
											<SortIcon field="code" />
										</button>
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('created_at')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
										>
											Fecha de Registro
											<SortIcon field="created_at" />
										</button>
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('full_name')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
										>
											Paciente
											<SortIcon field="full_name" />
										</button>
									</th>
									<th className="px-3 py-3 text-center">
										<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Sede
										</span>
									</th>
									<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
										Estudio
									</th>
									<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
										Médico Tratante
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('total_amount')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
										>
											Monto Total
											<SortIcon field="total_amount" />
										</button>
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredAndSortedCases.map((case_) => {
									const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
									const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
									const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

									return (
										<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
											<td className="px-4 py-4">
												<div className="flex flex-col items-start space-y-1 text-left">
													{case_.code && (
														<div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-1">
															{case_.code}
														</div>
													)}
													<span
														className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
															case_.payment_status,
														)}`}
													>
														{case_.payment_status}
													</span>
												</div>
											</td>
											<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-left">
												{case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
											</td>
											<td className="px-4 py-4">
												<div className="text-left">
													<div className="text-sm font-medium text-gray-900 dark:text-gray-100">{case_.full_name}</div>
													<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
														<span>{case_.id_number}</span>
														{ageDisplay && (
															<>
																<span>•</span>
																<span>{ageDisplay}</span>
															</>
														)}
													</div>
												</div>
											</td>
											<td className="text-sm text-gray-900 dark:text-gray-100">
												<div className="bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1">
													{case_.branch}
												</div>
											</td>
											<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
												{case_.exam_type}
											</td>
											<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{case_.treating_doctor}</td>
											<td className="px-4 py-4">
												<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
													${case_.total_amount.toLocaleString()}
												</div>
												{case_.remaining > 0 && (
													<div className="text-xs text-red-600 dark:text-red-400">
														Faltante: ${case_.remaining.toLocaleString()}
													</div>
												)}
											</td>
											<td className="px-4 py-4">
												<div className="flex gap-2">
													<button
														onClick={(e) => {
															e.stopPropagation()
															onCaseSelect(case_)
														}}
														className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
													>
														<Eye className="w-3 h-3" />
														Ver
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleGenerateCase(case_)
														}}
														className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium ${
															isBiopsyCase 
																? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300" 
																: "text-gray-400 dark:text-gray-600 cursor-not-allowed"
														} transition-colors`}
														disabled={!isBiopsyCase}
													>
														<FileText className="w-3 h-3" />
														Generar
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleDownloadCase(case_)
														}}
														className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium ${
															hasDownloadableContent 
																? "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300" 
																: "text-gray-400 dark:text-gray-600 cursor-not-allowed"
														} transition-colors`}
														disabled={!hasDownloadableContent || isDownloading === case_.id}
													>
														{isDownloading === case_.id ? (
															<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
														) : (
															<Download className="w-3 h-3" />
														)}
														Descargar
													</button>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>

						{filteredAndSortedCases.length === 0 && (
							<div className="text-center py-12">
								<div className="text-gray-500 dark:text-gray-400">
									<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p className="text-lg font-medium">No se encontraron casos</p>
									<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full">
				{/* Search and Filter Controls */}
				<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex flex-wrap items-center gap-4">
						{/* Search and Filters Row */}
						<div className="flex flex-col sm:flex-row gap-4 flex-1">
							{/* Search - Acortada */}
							<div className="w-full sm:max-w-md relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar por nombre, código, cédula, estudio o médico..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								/>
							</div>

							{/* Status Filter - Updated with only Completado and Incompleto */}
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4 text-gray-400" />
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estatus</option>
									<option value="Completado">Completado</option>
									<option value="Incompleto">Incompleto</option>
								</select>
							</div>

							{/* Branch Filter */}
							<div className="flex items-center gap-2">
								<select
									value={branchFilter}
									onChange={(e) => setBranchFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todas las sedes</option>
									<option value="PMG">PMG</option>
									<option value="CPC">CPC</option>
									<option value="CNX">CNX</option>
									<option value="STX">STX</option>
									<option value="MCY">MCY</option>
								</select>
							</div>

							{/* Exam Type Filter */}
							<div className="flex items-center gap-2">
								<select
									value={examTypeFilter}
									onChange={(e) => setExamTypeFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estudios</option>
									<option value="inmunohistoquimica">Inmunohistoquímica</option>
									<option value="biopsia">Biopsia</option>
									<option value="citologia">Citología</option>
								</select>
							</div>
						</div>

						{/* Row Limit Selector */}
						<div className="flex items-center gap-2">
							<label htmlFor="rowLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Mostrar:
							</label>
							<select
								id="rowLimit"
								value={rowLimit}
								onChange={(e) => setRowLimit(Number(e.target.value))}
								className="px-3 py-1 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
							>
								<option value={5}>Últimos 5 casos</option>
								<option value={10}>Últimos 10 casos</option>
								<option value={20}>Últimos 20 casos</option>
								<option value={50}>Últimos 50 casos</option>
								<option value={0}>Todos los casos</option>
							</select>
						</div>

						{/* Results count */}
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Mostrando {filteredAndSortedCases.length} de{' '}
							{
								cases.filter((case_) => {
									if (!case_) return false;
									
									const matchesSearch =
										(case_.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
										(case_.id_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.exam_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.treating_doctor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.branch?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
										(case_.code && case_.code.toLowerCase().includes(searchTerm.toLowerCase()))

									let matchesStatus = true
									if (statusFilter === 'Completado') {
										matchesStatus = case_.payment_status === 'Completado'
									} else if (statusFilter === 'Incompleto') {
										matchesStatus = case_.payment_status !== 'Completado'
									}

									const matchesBranch = branchFilter === 'all' || case_.branch === branchFilter
									const matchesExamType = examTypeFilter === 'all' || case_.exam_type === examTypeFilter

									return matchesSearch && matchesStatus && matchesBranch && matchesExamType
								}).length
							}{' '}
							casos
						</div>
					</div>
				</div>

				{/* Mobile View - Cards */}
				<div className="block lg:hidden">
					<div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
						{filteredAndSortedCases.map((case_) => (
							<CaseCard key={case_.id} case_={case_} />
						))}

						{filteredAndSortedCases.length === 0 && (
							<div className="text-center py-12">
								<div className="text-gray-500 dark:text-gray-400">
									<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p className="text-lg font-medium">No se encontraron casos</p>
									<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Desktop View - Table */}
				<div className="hidden lg:block">
					<div className="overflow-x-auto">
						<div className="max-h-[60vh] overflow-y-auto">
							<table className="w-full">
								<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-50">
									<tr>
										<th className="px-4 py-3 text-left">
											<button
												onClick={() => handleSort('code')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
											>
												Código / Estatus
												<SortIcon field="code" />
											</button>
										</th>
										<th className="px-4 py-3 text-left">
											<button
												onClick={() => handleSort('created_at')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
											>
												Fecha de Registro
												<SortIcon field="created_at" />
											</button>
										</th>
										<th className="px-4 py-3 text-left">
											<button
												onClick={() => handleSort('full_name')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
											>
												Paciente
												<SortIcon field="full_name" />
											</button>
										</th>
										<th className="px-3 py-3 text-center">
											<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												Sede
											</span>
										</th>
										<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
											Estudio
										</th>
										<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
											Médico Tratante
										</th>
										<th className="px-4 py-3 text-left">
											<button
												onClick={() => handleSort('total_amount')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
											>
												Monto Total
												<SortIcon field="total_amount" />
											</button>
										</th>
										<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{filteredAndSortedCases.map((case_) => {
										const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
										const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
										const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

										return (
											<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
												<td className="px-4 py-4">
													<div className="flex flex-col items-start space-y-1 text-left">
														{case_.code && (
															<div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-1">
																{case_.code}
															</div>
														)}
														<span
															className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
																case_.payment_status,
															)}`}
														>
															{case_.payment_status}
														</span>
													</div>
												</td>
												<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-left">
													{case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
												</td>
												<td className="px-4 py-4">
													<div className="text-left">
														<div className="text-sm font-medium text-gray-900 dark:text-gray-100">{case_.full_name}</div>
														<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
															<span>{case_.id_number}</span>
															{ageDisplay && (
																<>
																	<span>•</span>
																	<span>{ageDisplay}</span>
																</>
															)}
														</div>
													</div>
												</td>
												<td className="text-sm text-gray-900 dark:text-gray-100">
													<div className="bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1">
														{case_.branch}
													</div>
												</td>
												<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
													{case_.exam_type}
												</td>
												<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{case_.treating_doctor}</td>
												<td className="px-4 py-4">
													<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
														${case_.total_amount.toLocaleString()}
													</div>
													{case_.remaining > 0 && (
														<div className="text-xs text-red-600 dark:text-red-400">
															Faltante: ${case_.remaining.toLocaleString()}
														</div>
													)}
												</td>
												<td className="px-4 py-4">
													<div className="flex gap-2">
														<button
															onClick={(e) => {
																e.stopPropagation()
																onCaseSelect(case_)
															}}
															className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
														>
															<Eye className="w-3 h-3" />
															Ver
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation()
																handleGenerateCase(case_)
															}}
															className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium ${
																isBiopsyCase 
																	? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300" 
																	: "text-gray-400 dark:text-gray-600 cursor-not-allowed"
															} transition-colors`}
															disabled={!isBiopsyCase}
														>
															<FileText className="w-3 h-3" />
															Generar
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation()
																handleDownloadCase(case_)
															}}
															className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium ${
																hasDownloadableContent 
																	? "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300" 
																	: "text-gray-400 dark:text-gray-600 cursor-not-allowed"
															} transition-colors`}
															disabled={!hasDownloadableContent || isDownloading === case_.id}
														>
															{isDownloading === case_.id ? (
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
															) : (
																<Download className="w-3 h-3" />
															)}
															Descargar
														</button>
													</div>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>

							{filteredAndSortedCases.length === 0 && (
								<div className="text-center py-12">
									<div className="text-gray-500 dark:text-gray-400">
										<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p className="text-lg font-medium">No se encontraron casos</p>
										<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Generate Biopsy Modal */}
			<GenerateBiopsyModal
				case_={selectedCaseForGenerate}
				isOpen={isGenerateModalOpen}
				onClose={() => {
					setIsGenerateModalOpen(false);
					setSelectedCaseForGenerate(null);
				}}
				onSuccess={() => {
					refetch();
				}}
			/>
		</>
	)
}

export default CasesTable