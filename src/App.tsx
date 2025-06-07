import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
	return (
		<Router>
			<div className="App">
				<Routes>
					{/* Rutas públicas */}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />

					{/* Ruta por defecto */}
					<Route path="/" element={<Navigate to="/login" />} />
				</Routes>
			</div>
		</Router>
	)
}

export default App
