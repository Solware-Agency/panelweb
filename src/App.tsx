import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { RegisterPage } from '@features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage'
import PasswordResetPage from '@features/auth/pages/PasswordResetPage'
import NewPasswordPage from '@features/auth/pages/NewPasswordPage'
import PrivateRoute from '@app/routes/PrivateRoute'
import EmailVerificationNotice from '@features/auth/other/EmailVerificationNotice'
import PendingApprovalPage from '@features/auth/other/PendingApprovalPage'
import AuthCallback from '@features/auth/other/AuthCallback'
import Layout from '@features/dashboard/layouts/Layout'
import HomePage from '@features/dashboard/home/HomePage'
import StatsPage from '@features/dashboard/stats/StatsPage'
import ReportsPage from '@features/dashboard/reports/ReportsPage'
import UsersPage from '@features/dashboard/users/UsersPage'
import CasesPage from '@features/dashboard/cases/CasesPage'
import SettingsPage from '@features/dashboard/settings/SettingsPage'
import GenerateCasePage from '@features/dashboard/cases/GenerateCasePage'
import Form from '@features/form/pages/Form'
import FormRoute from '@app/routes/FormRoute'
import CaseSelectionPage from '@features/form/pages/CaseSelectionPage'

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

					{/* Case Selection Page - accessible by owners, doctors and employees */}
					<Route
						path="/cases-selection"
						element={
							<PrivateRoute requiredRole={undefined}>
								<CaseSelectionPage />
							</PrivateRoute>
						}
					/>

					{/* Generate Case Page - accessible by owners, doctors and employees */}
					<Route
						path="/generar-caso/:id"
						element={
							<PrivateRoute requiredRole={undefined}>
								<GenerateCasePage />
							</PrivateRoute>
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
						<Route path="settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App