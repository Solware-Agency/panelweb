import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/button'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MedicalForm } from '@/features/form/MedicalForm'
import { RecordsSection } from '@/features/form/RecordsSection'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@/supabase/auth'

const queryClient = new QueryClient()

export default function Form() {
	const [activeTab, setActiveTab] = useState('form')
	const navigate = useNavigate()

	const handleClearForm = () => {
		window.dispatchEvent(new CustomEvent('clearForm'))
	}

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="ui-theme">
				<Toaster />
				<Sonner />
				<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
					{activeTab === 'form' && (
						<Button variant="outline" onClick={handleClearForm}>
							Limpiar
						</Button>
					)}
					<Button variant="destructive" onClick={handleLogout}>
						Cerrar sesión
					</Button>
					<ThemeToggle />
				</div>

				<div className="container mx-auto py-10 px-4">
					<main>
						<div className="mb-6">
							<h2 className="text-2xl font-semibold text-foreground mb-2">Sistema de Registros Médicos</h2>
							<div className="w-24 h-1 bg-primary mt-3 rounded-full" />
						</div>

						<Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="mb-6">
								<TabsTrigger value="form">Formulario</TabsTrigger>
								<TabsTrigger value="records">Registros</TabsTrigger>
							</TabsList>

							<TabsContent value="form">
								<MedicalForm />
							</TabsContent>

							<TabsContent value="records">
								<RecordsSection />
							</TabsContent>
						</Tabs>
					</main>
				</div>
			</ThemeProvider>
		</QueryClientProvider>
	)
}
