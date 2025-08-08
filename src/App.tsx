import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import {
	LoginPage,
	RegisterPage,
	ForgotPasswordPage,
	PasswordResetPage,
	NewPasswordPage,
	EmailVerificationNotice,
	PendingApprovalPage,
	AuthCallback,
	Layout,
	HomePage,
	StatsPage,
	ReportsPage,
	UsersPage,
	CasesPage,
	MyCasesPage,
	SettingsPage,
	ChangelogPage,
	Form,
	PatientsPage,
	FormRoute,
	PrivateRoute,
	DoctorsSection,
} from '@app/routes/lazy-routes'

// Loading component for Suspense fallback
const LoadingSpinner = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
	</div>
)

// Create a client instance
const queryClient = new QueryClient()

function RecoveryGate() {
	const location = useLocation()
	const navigate = useNavigate()

	// Redirige a /auth/callback si detecta tipo recovery en query o en hash
	if (typeof window !== 'undefined') {
		const isOnCallback = location.pathname === '/auth/callback'
		const isOnNewPassword = location.pathname === '/new-password'

		if (!isOnCallback && !isOnNewPassword) {
			const searchParams = new URLSearchParams(location.search)
			const typeQuery = searchParams.get('type')

			const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
			const hashParams = new URLSearchParams(rawHash)
			const typeHash = hashParams.get('type')

			if (typeQuery === 'recovery' || typeHash === 'recovery') {
				const nextUrl = `/auth/callback${location.search || ''}${location.hash || ''}`
				navigate(nextUrl, { replace: true })
			}
		}
	}

	return null
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter
				future={{
					v7_startTransition: true,
					v7_relativeSplatPath: true,
				}}
			>
				<div className="App">
					<Suspense fallback={<LoadingSpinner />}>
						<RecoveryGate />
						<Routes>
							{/* Public routes */}
							<Route path="/" element={<LoginPage />} />
							<Route path="/register" element={<RegisterPage />} />
							<Route path="/forgot-password" element={<ForgotPasswordPage />} />
							<Route path="/reset-password" element={<PasswordResetPage />} />
							<Route path="/new-password" element={<NewPasswordPage />} />
							<Route path="/email-verification-notice" element={<EmailVerificationNotice />} />
							<Route path="/pending-approval" element={<PendingApprovalPage />} />

							{/* Auth callback route for email verification and password reset */}
							<Route path="/auth/callback" element={<AuthCallback />} />

							{/* Form route for regular users */}
							<Route
								path="/form"
								element={
									<FormRoute>
										<Form />
									</FormRoute>
								}
							/>

							{/* Form sub-routes for Employee users */}
							<Route
								path="/records"
								element={
									<FormRoute>
										<Form />
									</FormRoute>
								}
							/>
							<Route
								path="/doctors"
								element={
									<FormRoute>
										<Form />
									</FormRoute>
								}
							/>
							<Route
								path="/patients"
								element={
									<FormRoute>
										<Form />
									</FormRoute>
								}
							/>
							<Route
								path="/settings"
								element={
									<FormRoute>
										<Form />
									</FormRoute>
								}
							/>

							{/* Default route */}
							<Route path="/" element={<LoginPage />} />

							{/* Protected dashboard routes */}
							<Route
								path="/dashboard"
								element={
									<PrivateRoute requiredRole={undefined}>
										<Layout />
									</PrivateRoute>
								}
							>
								{/* Nested routes that will render in the Outlet */}
								<Route index element={<HomePage />} />
								<Route path="home" element={<HomePage />} />
								<Route path="stats" element={<StatsPage />} />
								<Route path="reports" element={<ReportsPage />} />
								<Route path="users" element={<UsersPage />} />
								<Route path="cases" element={<CasesPage />} />
								<Route path="my-cases" element={<MyCasesPage />} />
								<Route path="settings" element={<SettingsPage />} />
								<Route path="patients" element={<PatientsPage />} />
								<Route path="changelog" element={<ChangelogPage />} />
								<Route path="doctors" element={<DoctorsSection />} />
							</Route>
						</Routes>
					</Suspense>
				</div>
			</BrowserRouter>
		</QueryClientProvider>
	)
}

export default App
