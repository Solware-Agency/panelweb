import { Toaster } from '@shared/components/ui/toaster'
import { Toaster as Sonner } from '@shared/components/ui/sonner'
import { ThemeProvider } from '@app/providers/ThemeProvider'
import { ThemeToggle } from '@shared/components/ui/ThemeToggle'
import { Button } from '@shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { MedicalForm } from '@features/form/components/MedicalForm'
import { RecordsSection } from '@features/form/components/RecordsSection'
import { SettingsSection } from '@features/form/components/SettingsSection'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'
import { getMedicalRecords } from '@lib/supabase-service'
import { RefreshCw, Maximize2 } from 'lucide-react'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { DoctorsSection } from '@features/form/components/DoctorsSection'

function FormContent() {
	const [activeTab, setActiveTab] = useState('form')
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [currentPage, setCurrentPage] = useState(0)
	const pageSize = 100
	const navigate = useNavigate()
	const { profile } = useUserProfile()

	// Query for medical records data with pagination
	const {
		data: casesData,
		isLoading: casesLoading,
		error: casesError,
		refetch: refetchCases,
	} = useQuery({
		queryKey: ['medical-cases', currentPage, pageSize],
		queryFn: () => getMedicalRecords(pageSize, currentPage),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	const handleClearForm = () => {
		window.dispatchEvent(new CustomEvent('clearForm'))
	}

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	const handleRefreshCases = () => {
		refetchCases()
	}

	const handleToggleFullscreen = () => {
		setIsFullscreen(true)
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	return (
		<>
			<Toaster />
			<Sonner />
			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				{activeTab === 'form' && (
					<Button variant="outline" onClick={handleClearForm} className="shadow-xl dark:shadow-black shadow-black/40">
						Limpiar
					</Button>
				)}
				{activeTab === 'records' && (
					<>
						<button
							onClick={handleToggleFullscreen}
							className="hidden lg:flex px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm items-center gap-2 shadow-xl dark:shadow-black shadow-black/40"
						>
							<Maximize2 className="size-3" />
							Expandir
						</button>
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
						<h3 className='text-md text-primary font-semibold mt-4'>Bienvenido, {profile?.display_name}</h3>
					</div>

					<Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="mb-6">
							<TabsTrigger value="form">Formulario</TabsTrigger>
							<TabsTrigger value="records">Registros</TabsTrigger>
							<TabsTrigger value="doctors">Médicos</TabsTrigger>
							<TabsTrigger value="settings">Ajustes</TabsTrigger>
						</TabsList>

						<TabsContent value="form" className="mt-6">
							<MedicalForm />
						</TabsContent>

						<TabsContent value="records" className="mt-6">
							<RecordsSection
								cases={casesData?.data || []}
								isLoading={casesLoading}
								error={casesError}
								refetch={refetchCases}
								isFullscreen={isFullscreen}
								setIsFullscreen={setIsFullscreen}
								pagination={casesData?.pagination}
								onPageChange={handlePageChange}
							/>
						</TabsContent>

						<TabsContent value="settings" className="mt-6">
							<SettingsSection />
						</TabsContent>

						<TabsContent value="doctors" className="mt-6">
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
			<FormContent />
		</ThemeProvider>
	)
}