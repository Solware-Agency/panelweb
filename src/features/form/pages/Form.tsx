import { Toaster } from '@shared/components/ui/toaster'
import { Toaster as Sonner } from '@shared/components/ui/sonner'
import { ThemeProvider } from '@app/providers/ThemeProvider'
import { useQuery } from '@tanstack/react-query'
import { MedicalForm } from '@features/form/components/MedicalForm'
import { RecordsSection } from '@features/form/components/RecordsSection'
import { SettingsSection } from '@features/form/components/SettingsSection'
import { useState, useCallback, Suspense, useEffect } from 'react'
import { Tabs, TabsContent } from '@shared/components/ui/tabs'
import { getMedicalRecords, searchMedicalRecords } from '@lib/supabase-service'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { DoctorsSection } from '@features/form/components/DoctorsSection'
import PatientsPage from '@features/dashboard/patients/PatientsPage'
import Sidebar from '@shared/components/Sidebar'
import { useDarkMode } from '@shared/hooks/useDarkMode'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

// Loading fallback component
const LoadingFallback = () => (
	<div className="flex items-center justify-center h-64">
		<div className="flex flex-col items-center gap-4">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<p className="text-muted-foreground">Cargando datos...</p>
		</div>
	</div>
)

function FormContent() {
	const [activeTab, setActiveTab] = useState('form')
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const { profile } = useUserProfile()
	const { isDark, setIsDark } = useDarkMode()
	const [currentDate, setCurrentDate] = useState('')
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [sidebarExpanded, setSidebarExpanded] = useState(false) // New state for hover expansion
	const location = useLocation()
	const navigate = useNavigate()

	// Determine active tab based on current route
	useEffect(() => {
		const pathname = location.pathname
		if (pathname === '/form') {
			setActiveTab('form')
		} else if (pathname === '/form/records') {
			setActiveTab('records')
		} else if (pathname === '/form/doctors') {
			setActiveTab('doctors')
		} else if (pathname === '/form/patients') {
			setActiveTab('patients')
		} else if (pathname === '/form/settings') {
			setActiveTab('settings')
		}
	}, [location.pathname])

	useEffect(() => {
		const getCurrentDate = () => {
			const now = new Date()
			const months = [
				'Enero',
				'Febrero',
				'Marzo',
				'Abril',
				'Mayo',
				'Junio',
				'Julio',
				'Agosto',
				'Septiembre',
				'Octubre',
				'Noviembre',
				'Diciembre',
			]
			return `${months[now.getMonth()]} ${now.getDate()}`
		}

		setCurrentDate(getCurrentDate())

		const now = new Date()
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
		const timeUntilMidnight = tomorrow.getTime() - now.getTime()

		const timer = setTimeout(() => {
			setCurrentDate(getCurrentDate())
		}, timeUntilMidnight)

		return () => clearTimeout(timer)
	}, [])

	const toggleDarkMode = () => {
		setIsDark(!isDark)
	}

	const handleSidebarMouseEnter = () => {
		setSidebarExpanded(true)
	}

	const handleSidebarMouseLeave = () => {
		setSidebarExpanded(false)
	}

	// Query for medical records data - fetch all records at once
	// Only enable the query when the records tab is active to save resources
	const {
		data: casesData,
		isLoading: casesLoading,
		error: casesError,
		refetch: refetchCases,
	} = useQuery({
		queryKey: ['medical-cases', searchTerm],
		queryFn: () => (searchTerm ? searchMedicalRecords(searchTerm) : getMedicalRecords()),
		staleTime: 1000 * 60 * 5, // 5 minutes
		// Add refetchOnWindowFocus to false to prevent unnecessary refetches
		refetchOnWindowFocus: false,
		// Only enable the query when the records tab is active
		enabled: activeTab === 'records',
	})

	const handleRefreshCases = useCallback(() => {
		refetchCases()
	}, [refetchCases])

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term)
	}, [])

	// Handle tab change with routing for Employee users
	const handleTabChange = useCallback(
		(value: string) => {
			setActiveTab(value)

			// If user is Employee, navigate to the corresponding route
			if (profile?.role === 'employee') {
				const routeMap = {
					form: '/form',
					records: '/form/records',
					doctors: '/form/doctors',
					patients: '/form/patients',
					settings: '/form/settings',
				}
				navigate(routeMap[value as keyof typeof routeMap])
			}

			// If switching to records tab, refetch data
			if (value === 'records') {
				refetchCases()
			}
		},
		[refetchCases, profile?.role, navigate],
	)

	return (
		<>
			<Toaster />
			<Sonner />
			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				{activeTab === 'records' && (
					<>
						<button
							onClick={handleRefreshCases}
							disabled={casesLoading}
							className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-xl dark:shadow-black shadow-black/40"
						>
							<RefreshCw className={`w-4 h-4 ${casesLoading ? 'animate-spin' : ''}`} />
						</button>
					</>
				)}
			</div>

			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 z-[999998] lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			<div
				className={`fixed top-0 left-0 h-screen z-[9999999] lg:z-10 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} ${
					// On desktop: collapsed by default (w-16), expanded on hover (w-56)
					sidebarExpanded ? 'lg:w-56' : 'lg:w-16'
				}`}
				onMouseEnter={handleSidebarMouseEnter}
				onMouseLeave={handleSidebarMouseLeave}
			>
				<Sidebar
					onClose={() => setSidebarOpen(false)}
					isExpanded={sidebarExpanded}
					isMobile={sidebarOpen}
					isDark={isDark}
					toggleDarkMode={toggleDarkMode}
					currentDate={currentDate}
				/>
			</div>
			<div className="container mx-auto py-10 px-4">
				<main
					className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out z-50 ${
						sidebarExpanded ? 'lg:ml-56' : 'lg:ml-16'
					}`}
				>
					<div className="mb-6">
						{/* Logo */}
						<h2 className="text-2xl font-semibold text-foreground mb-2">Sistema de Registros Médicos</h2>
						<div className="w-24 h-1 bg-primary mt-3 rounded-full" />
						<h3 className="text-sm sm:text-md text-primary font-semibold mt-3 sm:mt-4">
							Bienvenido, {profile?.display_name}
						</h3>
					</div>

					<Tabs defaultValue="form" value={activeTab} onValueChange={handleTabChange}>
						{/* Only show tabs for non-Employee users */}

						{/* <TabsList className="sm:mb-6 overflow-x-auto flex-nowrap gap-2">
							<TabsTrigger value="form">Formulario</TabsTrigger>
							<TabsTrigger value="records">Registros</TabsTrigger>
							<TabsTrigger value="doctors">Médicos</TabsTrigger>
							<TabsTrigger value="patients">Pacientes</TabsTrigger>
							<TabsTrigger value="settings">Ajustes</TabsTrigger>
						</TabsList> */}

						<TabsContent value="form" className="mt-4 sm:mt-6">
							<MedicalForm />
						</TabsContent>

						<TabsContent value="records" className="mt-4 sm:mt-6">
							<Suspense fallback={<LoadingFallback />}>
								<RecordsSection
									cases={casesData?.data || []}
									isLoading={casesLoading}
									error={casesError}
									refetch={refetchCases}
									isFullscreen={isFullscreen}
									setIsFullscreen={setIsFullscreen}
									onSearch={handleSearch}
								/>
							</Suspense>
						</TabsContent>

						<TabsContent value="settings" className="mt-4 sm:mt-6">
							<SettingsSection />
						</TabsContent>

						<TabsContent value="doctors" className="mt-4 sm:mt-6">
							<DoctorsSection />
						</TabsContent>

						<TabsContent value="patients" className="mt-4 sm:mt-6">
							<PatientsPage />
						</TabsContent>
					</Tabs>
				</main>
			</div>
		</>
	)
}

export default function Form() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="ui-theme">
			<div className="overflow-x-hidden">
				<FormContent />
			</div>
		</ThemeProvider>
	)
}
