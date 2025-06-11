import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDarkMode } from '../../hooks/useDarkMode'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout: React.FC = () => {
	const { isDark, setIsDark } = useDarkMode()
	const [currentDate, setCurrentDate] = useState('')

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#3A71EC] via-[#6C5CEC] to-[#9949EC] dark:from-[#2F2E7B] dark:via-[#412982] dark:to-[#511F80] transition-colors duration-300">
			{/* Sidebar with fixed position */}
			<div className="fixed top-0 left-0 h-screen w-64 z-10">
				<Sidebar />
			</div>

			{/* Main content with left margin to compensate for sidebar */}
			<div className="ml-64 min-h-screen flex flex-col">
				<Header isDark={isDark} toggleDarkMode={toggleDarkMode} currentDate={currentDate} />
				<Outlet />
			</div>
		</div>
	)
}

export default Layout