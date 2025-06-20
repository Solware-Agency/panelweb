import { useState, useEffect } from 'react'

export const useDarkMode = () => {
	const [isDark, setIsDark] = useState(() => {
		if (typeof window === 'undefined') return false

		const savedTheme = localStorage.getItem('theme')
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

		return savedTheme === 'dark' || (!savedTheme && prefersDark)
	})

	useEffect(() => {
		const root = window.document.documentElement
		const transitionDuration = 300 // ms

		if (isDark) {
			root.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			// Agregar una pequeña transición al cambiar el tema
			root.style.transition = `background-color ${transitionDuration}ms ease-in-out`
			root.classList.remove('dark')
			localStorage.setItem('theme', 'light')

			// Limpiar la propiedad de transición después de que se complete
			setTimeout(() => {
				root.style.transition = ''
			}, transitionDuration)
		}
	}, [isDark])

	// Escuchar cambios en las preferencias del sistema
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

		const handleChange = (e: MediaQueryListEvent) => {
			setIsDark(e.matches)
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	return { isDark, setIsDark }
}
