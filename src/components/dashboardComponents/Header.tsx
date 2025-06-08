import React from 'react'
import { Moon, Sun, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../firebase/auth'

interface HeaderProps {
	isDark: boolean
	toggleDarkMode: () => void
	currentDate: string
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleDarkMode, currentDate }) => {
	const { user } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await logout()
		navigate('/login')
	}

	return (
		<div className="bg-white/80 dark:bg-gray-900/80 rounded-bl-xl transition-colors duration-300 ml-5">
			<header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
				<form className="w-96">
					<label htmlFor="default-search\" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
						Search
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
							<svg
								className="w-4 h-4 text-gray-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 20"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
								/>
							</svg>
						</div>
						<input
							type="search"
							id="default-search"
							className="block w-full p-2 ps-10 text-sm text-gray-200 border border-gray-500 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800"
							placeholder="Buscar..."
							required
						/>
					</div>
				</form>

				<div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
					<a href="#" className="text-sm hover:dark:text-white cursor-pointer">
						{currentDate}
					</a>
					<button
						onClick={toggleDarkMode}
						className="p-2 transition-colors hover:dark:text-white"
						aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
					>
						{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
					</button>
					<button className="p-2 transition-colors hover:dark:text-white">
						<Bell className="w-5 h-5" />
					</button>
					<div className="flex items-center gap-4">
						{user && <span>{user.email}</span>}
						<button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
							Cerrar sesión
						</button>
					</div>
				</div>
			</header>
		</div>
	)
}

export default Header
