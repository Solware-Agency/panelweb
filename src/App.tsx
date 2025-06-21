import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import PrivateRoute from './routes/PrivateRoute'
import EmailVerificationNotice from '@/features/auth/EmailVerificationNotice'
import Layout from '@/layouts/dashboardLayout/Layout'
import HomePage from '@/features/dashboard/home/HomePage'
import CalendarPage from '@/features/dashboard/calendar/CalendarPage'
import StatsPage from '@/features/dashboard/stats/StatsPage'
import ReportsPage from '@/features/dashboard/reports/ReportsPage'
import CasesPage from '@/features/dashboard/cases/CasesPage'
import Form from '@/pages/Form'
import FormRoute from '@/routes/FormRoute'
import AuthCallback from '@/features/auth/AuthCallback'
// import FormularioPage from './pages/Form'

function App() {
	return (
		<BrowserRouter
			future={{
				v7_startTransition: true,
				v7_relativeSplatPath: true,
			}}
		>
			<div className="App">
				<Routes>
					{/* Public routes */}
					<Route path="/" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/email-verification-notice" element={<EmailVerificationNotice />} />

					{/* Auth callback route for email verification */}
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

					{/* Default route */}
					<Route path="/" element={<LoginPage />} />

					{/* Protected dashboard routes (owner only) */}
					<Route
						path="/dashboard"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						{/* Nested routes that will render in the Outlet */}
						<Route index element={<HomePage />} />
						<Route path="home" element={<HomePage />} />
						<Route path="calendar" element={<CalendarPage />} />
						<Route path="stats" element={<StatsPage />} />
						<Route path="reports" element={<ReportsPage />} />
						<Route path="cases" element={<CasesPage />} />
					</Route>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App
