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
		<div className="bg-white dark:bg-background/50 backdrop-blur-[10px] transition-colors duration-300 sticky top-0 left-0 z-30 shadow-xl lg:hidden border-b border-input w-full">
			<header className="flex justify-between items-center px-3 sm:px-6 py-3 sm:py-4">
				{/* Mobile menu button and search */}
				<div className="flex items-center gap-3">
					<button
						onClick={onMenuClick}
						className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
					>
						<Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
					<h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Panel Conspat</h1>
				</div>
			</header>
		</div>
	)
}

export default Header
