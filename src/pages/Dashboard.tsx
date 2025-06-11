import React, { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

import { useDarkMode } from '../hooks/useDarkMode'
import Header from '../components/dashboardComponents/Header'
import Sidebar from '../components/dashboardComponents/Sidebar'
import Home from '../components/dashboardPages/Home'
import Stats from '../components/dashboardPages/Stats'
import Calendar from '../components/dashboardPages/Calendar'
import { Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'

interface ThemeContextProps {
	theme: 'light' | 'dark'
	toggleTheme: () => void
}
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setTheme] = useState<'light' | 'dark'>('light')

	const toggleTheme = () => {
		setTheme((prev) => {
			const next = prev === 'light' ? 'dark' : 'light'
			if (next === 'dark') {
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
			return next
		})
	}

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

const Dashboard: React.FC = () => {
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
			{/* Sidebar con posición fija */}
			<div className="fixed top-0 left-0 h-screen w-64 z-10">
				<Sidebar />
			</div>

			{/* Contenido principal con margen izquierdo para compensar el sidebar */}
			<div className="ml-64 min-h-screen flex flex-col">
				<Header isDark={isDark} toggleDarkMode={toggleDarkMode} currentDate={currentDate} />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/stats" element={<Stats />} />
					<Route path="/calendar" element={<Calendar />} />
				</Routes>
			</div>
		</div>
	)
}

export default function DashboardWrapper() {
	return (
		<ThemeProvider>
			<Dashboard />
		</ThemeProvider>
	)
}
