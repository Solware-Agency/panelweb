import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import PrivateRoute from './routes/PrivateRoute'
import EmailVerificationNotice from './components/EmailVerificationNotice'
import Layout from './components/dashboardLayout/Layout'
import HomePage from './pages/dashboard/home/HomePage'
import CalendarPage from './pages/dashboard/calendar/CalendarPage'
import StatsPage from './pages/dashboard/stats/StatsPage'
import ReportsPage from './pages/dashboard/reports/ReportsPage'
import Form from './pages/Form'
import FormRoute from './routes/FormRoute'

function App() {
	return (
		<Router
			future={{
				v7_startTransition: true,
				v7_relativeSplatPath: true,
			}}
		>
			<div className="App">
				<Routes>
					{/* Public routes */}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/email-verification-notice" element={<EmailVerificationNotice />} />
					<Route
						path="/form"
						element={
							<FormRoute>
								<Form />
							</FormRoute>
						}
					/>

					{/* Default route */}
					<Route path="/" element={<Navigate to="/login" />} />

					{/* Protected dashboard routes */}
					<Route
						path="/dashboard"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						{/* Nested routes that will render in the Outlet */}
						<Route index element={<Navigate to="/dashboard/home" replace />} />
						<Route path="home" element={<HomePage />} />
						<Route path="calendar" element={<CalendarPage />} />
						<Route path="stats" element={<StatsPage />} />
						<Route path="reports" element={<ReportsPage />} />
					</Route>
				</Routes>
			</div>
		</Router>
	)
}

export default App