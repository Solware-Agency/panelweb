import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { RegisterPage } from '@features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage'
import PasswordResetPage from '@features/auth/pages/PasswordResetPage'
import NewPasswordPage from '@features/auth/pages/NewPasswordPage'
import PrivateRoute from '@app/routes/PrivateRoute'
import EmailVerificationNotice from '@features/auth/other/EmailVerificationNotice'
import AuthCallback from '@features/auth/other/AuthCallback'
import Layout from '@features/dashboard/layouts/Layout'
import HomePage from '@features/dashboard/home/HomePage'
import CalendarPage from '@features/dashboard/calendar/CalendarPage'
import StatsPage from '@features/dashboard/stats/StatsPage'
import ReportsPage from '@features/dashboard/reports/ReportsPage'
import UsersPage from '@features/dashboard/users/UsersPage'
import CasesPage from '@features/dashboard/cases/CasesPage'
import Form from '@features/form/pages/Form'
import FormRoute from '@app/routes/FormRoute'

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
					<Route path="/reset-password" element={<PasswordResetPage />} />
					<Route path="/new-password" element={<NewPasswordPage />} />
					<Route path="/email-verification-notice" element={<EmailVerificationNotice />} />

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

					{/* Default route */}
					<Route path="/" element={<LoginPage />} />

					{/* Protected dashboard routes (owner only) */}
					<Route
						path="/dashboard/home"
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
						<Route path="users" element={<UsersPage />} />
						<Route path="cases" element={<CasesPage />} />
					</Route>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App