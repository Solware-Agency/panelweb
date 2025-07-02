import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDarkMode } from '@shared/hooks/useDarkMode'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout: React.FC = () => {
	const { isDark, setIsDark } = useDarkMode()
	const [currentDate, setCurrentDate] = useState('')
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [sidebarExpanded, setSidebarExpanded] = useState(false) // New state for hover expansion

	useEffect(() => {
		const getCurrentDate = () => {
			const now = new Date()
			const months = [
				'Enero',
				'Febrero',
				'Marzo',
				'Abril',
				'Mayo',
				'Junio',
				'Julio',
				'Agosto',
				'Septiembre',
				'Octubre',
				'Noviembre',
				'Diciembre',
			]
			return `${months[now.getMonth()]} ${now.getDate()}`
		}

		setCurrentDate(getCurrentDate())

		const now = new Date()
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
		const timeUntilMidnight = tomorrow.getTime() - now.getTime()

		const timer = setTimeout(() => {
			setCurrentDate(getCurrentDate())
		}, timeUntilMidnight)

		return () => clearTimeout(timer)
	}, [])

	const toggleDarkMode = () => {
		setIsDark(!isDark)
	}

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen)
	}

	const handleSidebarMouseEnter = () => {
		setSidebarExpanded(true)
	}

	const handleSidebarMouseLeave = () => {
		setSidebarExpanded(false)
	}

	return (
		<div className="min-h-screen bg-white dark:bg-background transition-colors duration-300">
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-[999998] lg:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			{/* Sidebar - Updated with collapsible behavior */}
			<div
				className={`fixed top-0 left-0 h-screen z-[9999999] lg:z-10 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} ${
					// On desktop: collapsed by default (w-16), expanded on hover (w-56)
					sidebarExpanded ? 'lg:w-56' : 'lg:w-16'
				}`}
				onMouseEnter={handleSidebarMouseEnter}
				onMouseLeave={handleSidebarMouseLeave}
			>
				<Sidebar
					onClose={() => setSidebarOpen(false)}
					isExpanded={sidebarExpanded}
					isMobile={sidebarOpen}
					isDark={isDark}
					toggleDarkMode={toggleDarkMode}
					currentDate={currentDate}
				/>
			</div>

			{/* Main content - Updated margin to accommodate collapsible sidebar */}
			<div
				className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out z-50 ${
					sidebarExpanded ? 'lg:ml-56' : 'lg:ml-16'
				}`}
			>
				<Header isDark={isDark} toggleDarkMode={toggleDarkMode} currentDate={currentDate} onMenuClick={toggleSidebar} />
				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default Layout