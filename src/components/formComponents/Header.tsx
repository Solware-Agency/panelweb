import { useNavigate } from 'react-router-dom'
import { signOut } from '../../supabase/auth'

function Header() {
	const navigate = useNavigate()

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}
	return (
		<header className="flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-[10px] rounded-bl-xl transition-colors duration-300 sticky top-0 left-0 z-50">
			<h1 className="text-2xl font-bold">Formulario</h1>
			<div className="flex items-center gap-4">
				<button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-white">
					Cerrar sesión
				</button>
			</div>
		</header>
	)
}

export default Header
