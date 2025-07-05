import { Toaster } from '@shared/components/ui/toaster'
import { Toaster as Sonner } from '@shared/components/ui/sonner'
import { ThemeProvider } from '@app/providers/ThemeProvider'
import { ThemeToggle } from '@shared/components/ui/ThemeToggle'
import { useQuery } from '@tanstack/react-query'
import { useRef, useEffect } from 'react'
import { MedicalForm } from '@features/form/components/MedicalForm'
import { RecordsSection } from '@features/form/components/RecordsSection'
import { SettingsSection } from '@features/form/components/SettingsSection'
import { useState, useCallback, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs'
import { useLocation, useNavigate } from 'react-router-dom'
import { signOut } from '@lib/supabase/auth'
import { getMedicalRecords, searchMedicalRecords } from '@lib/supabase-service'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { DoctorsSection } from '@features/form/components/DoctorsSection'
import FormLayout from '@features/form/layouts/FormLayout'

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
	const [activeSection, setActiveSection] = useState('patient')
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const navigate = useNavigate()
	const { profile } = useUserProfile()
	const location = useLocation()
	const patientSectionRef = useRef<HTMLDivElement>(null)
	const serviceSectionRef = useRef<HTMLDivElement>(null)
	const paymentSectionRef = useRef<HTMLDivElement>(null)
	const commentsSectionRef = useRef<HTMLDivElement>(null)
	const recordsSectionRef = useRef<HTMLDivElement>(null)
	const settingsSectionRef = useRef<HTMLDivElement>(null)

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

	// Handle section change from sidebar
	const handleSectionChange = useCallback((section: string) => {
		setActiveSection(section)
		
		// If section is records or settings, change the tab
		if (section === 'records') {
			setActiveTab('records')
		} else if (section === 'settings') {
			setActiveTab('settings')
		} else {
			setActiveTab('form')
		}
		
		// Scroll to the appropriate section
		setTimeout(() => {
			let ref = null
			switch (section) {
				case 'patient':
					ref = patientSectionRef.current
					break
				case 'service':
					ref = serviceSectionRef.current
					break
				case 'payment':
					ref = paymentSectionRef.current
					break
				case 'comments':
					ref = commentsSectionRef.current
					break
				case 'records':
					ref = recordsSectionRef.current
					break
				case 'settings':
					ref = settingsSectionRef.current
					break
			}
			
			if (ref) {
				ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}
		}, 100)
	}, [])

	// Update active section based on scroll position
	useEffect(() => {
		const handleScroll = () => {
			if (activeTab !== 'form') return
			
			const scrollPosition = window.scrollY + 100
			
			// Get positions of all sections
			const patientPosition = patientSectionRef.current?.offsetTop || 0
			const servicePosition = serviceSectionRef.current?.offsetTop || 0
			const paymentPosition = paymentSectionRef.current?.offsetTop || 0
			const commentsPosition = commentsSectionRef.current?.offsetTop || 0
			
			// Determine active section based on scroll position
			if (scrollPosition >= commentsPosition) {
				setActiveSection('comments')
			} else if (scrollPosition >= paymentPosition) {
				setActiveSection('payment')
			} else if (scrollPosition >= servicePosition) {
				setActiveSection('service')
			} else {
				setActiveSection('patient')
			}
		}
		
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [activeTab])

	return (
		<FormLayout activeSection={activeSection} onSectionChange={handleSectionChange}>
			<div className="relative">
				<Toaster />
				<Sonner />
				
				{/* Fixed action buttons */}
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
					<ThemeToggle />
				</div>

				<div className="container mx-auto py-6 sm:py-10 px-3 sm:px-4">
					<main>
						{activeTab === 'form' && (
							<div className="space-y-6 sm:space-y-8">
								<div ref={patientSectionRef} id="patient-section">
									<MedicalForm />
								</div>
							</div>
						)}

						{activeTab === 'records' && (
							<div ref={recordsSectionRef} id="records-section">
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
							</div>
						)}

						{activeTab === 'settings' && (
							<div ref={settingsSectionRef} id="settings-section">
								<SettingsSection />
							</div>
						)}

						{activeTab === 'doctors' && (
							<div id="doctors-section">
								<DoctorsSection />
							</div>
						)}
					</main>
				</div>
			</div>
		</FormLayout>
	)
}

export default function Form() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="ui-theme">
			<FormContent />
		</ThemeProvider>
	)
}