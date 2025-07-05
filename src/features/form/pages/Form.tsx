import { Toaster } from '@shared/components/ui/toaster'
import { Toaster as Sonner } from '@shared/components/ui/sonner'
import { ThemeProvider } from '@app/providers/ThemeProvider'
import { ThemeToggle } from '@shared/components/ui/ThemeToggle'
import { useQuery } from '@tanstack/react-query'
import { MedicalForm } from '@features/form/components/MedicalForm'
import { RecordsSection } from '@features/form/components/RecordsSection'
import { SettingsSection } from '@features/form/components/SettingsSection'
import { Link } from 'react-router-dom'
import { useState, useCallback, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'
import { getMedicalRecords, searchMedicalRecords } from '@lib/supabase-service'
import { RefreshCw, Loader2, User } from 'lucide-react'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { DoctorsSection } from '@features/form/components/DoctorsSection'

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Cargando datos...</p>
    </div>
  </div>
);

function FormContent() {
	const [activeTab, setActiveTab] = useState('form')
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const navigate = useNavigate()
	const { profile } = useUserProfile()

	// Query for medical records data - fetch all records at once
	// Only enable the query when the records tab is active to save resources
	const {
		data: casesData,
		isLoading: casesLoading,
		error: casesError,
		refetch: refetchCases,
	} = useQuery({
		queryKey: ['medical-cases', searchTerm],
		queryFn: () => searchTerm 
			? searchMedicalRecords(searchTerm)
			: getMedicalRecords(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		// Add refetchOnWindowFocus to false to prevent unnecessary refetches
		refetchOnWindowFocus: false,
		// Only enable the query when the records tab is active
		enabled: activeTab === 'records',
	})

	const handleLogout = useCallback(async () => {
		await signOut()
		navigate('/')
	}, [navigate])

	const handleRefreshCases = useCallback(() => {
		refetchCases()
	}, [refetchCases])

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term)
	}, [])

	// Handle tab change with lazy loading
	const handleTabChange = useCallback((value: string) => {
		setActiveTab(value)
		
		// If switching to records tab, refetch data
		if (value === 'records') {
			refetchCases()
		}
	}, [refetchCases])

	return (
		<>
			<Toaster />
			<Sonner />
			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				<Link
					to="/patients"
					className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xl dark:shadow-black shadow-black/40"
				>
					<User className="w-4 h-4" />
					<span>Pacientes</span>
				</Link>
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
				<button
					onClick={handleLogout}
					className="bg-background text-foreground shadow-xl dark:shadow-black shadow-black/40 py-2 rounded-md px-5 border border-input hover:border-red-500 dark:hover:shadow-red-500 hover:shadow-sm"
				>
					Cerrar sesión
				</button>
				<ThemeToggle />
			</div>

			<div className="container mx-auto py-10 px-4">
				<main>
					<div className="mb-6">
						<h2 className="text-2xl font-semibold text-foreground mb-2">Sistema de Registros Médicos</h2>
						<div className="w-24 h-1 bg-primary mt-3 rounded-full" />
						<h3 className="text-sm sm:text-md text-primary font-semibold mt-3 sm:mt-4">
							Bienvenido, {profile?.display_name}
						</h3>
					</div>

					<Tabs defaultValue="form" value={activeTab} onValueChange={handleTabChange}>
						<TabsList className="mb-4 sm:mb-6 overflow-x-auto flex-nowrap gap-2">
							<TabsTrigger value="form">Formulario</TabsTrigger>
							<TabsTrigger value="records">Registros</TabsTrigger>
							<TabsTrigger value="doctors">Médicos</TabsTrigger>
							<TabsTrigger value="settings">Ajustes</TabsTrigger>
						</TabsList>

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