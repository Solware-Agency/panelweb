import React from 'react'
import { Menu } from 'lucide-react'

interface HeaderProps {
	isDark: boolean
	toggleDarkMode: () => void
	currentDate: string
	onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
	return (
		<div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-[10px] rounded-bl-xl transition-colors duration-300 ml-2 sm:ml-5 sticky top-0 left-0 z-30 shadow-xl lg:hidden">
			<header className="flex justify-between items-center px-3 sm:px-6 py-4">
				{/* Mobile menu button and search */}
				<div className="flex items-center gap-3">
					<button
						onClick={onMenuClick}
						className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						<Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
				</div>
			</header>
		</div>
	)
}

export default Header
