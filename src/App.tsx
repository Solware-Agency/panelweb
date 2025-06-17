import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import PrivateRoute from './routes/PrivateRoute';
import EmailVerificationNotice from './components/EmailVerificationNotice';
import Layout from './components/dashboardLayout/Layout';
import HomePage from './pages/dashboard/home/HomePage';
import CalendarPage from './pages/dashboard/calendar/CalendarPage';
import StatsPage from './pages/dashboard/stats/StatsPage';
import ReportsPage from './pages/dashboard/reports/ReportsPage';
import CasesPage from './pages/dashboard/cases/CasesPage';
import Form from './pages/Form';
import FormRoute from './routes/FormRoute';
import AuthCallback from './components/AuthCallback';
import FormularioPage from './pages/FormularioPage';

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
          <Route path="/login" element={<LoginPage />} />
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

          {/* New integrated form route */}
          <Route path="/formulario" element={<FormularioPage />} />

          {/* Default route */}
          <Route path="/" element={<FormularioPage />} />

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
  );
}

export default App;