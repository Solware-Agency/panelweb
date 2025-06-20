import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabase/config'

interface AutocompleteOption {
	value: string
	count: number
}

export const useAutocomplete = (fieldName: string, minLength: number = 2) => {
	const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const abortControllerRef = useRef<AbortController | null>(null)
	const lastSearchTermRef = useRef<string>('')

	const getSuggestions = async (searchTerm: string) => {
		// Si el término de búsqueda es igual al anterior, no hacer nada
		if (searchTerm === lastSearchTermRef.current) {
			return
		}

		// Cancelar búsqueda anterior si existe
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		if (searchTerm.length < minLength) {
			setSuggestions([])
			setIsLoading(false)
			lastSearchTermRef.current = ''
			return
		}

		// Crear nuevo AbortController para esta búsqueda
		abortControllerRef.current = new AbortController()
		const signal = abortControllerRef.current.signal

		setIsLoading(true)
		lastSearchTermRef.current = searchTerm

		try {
			// Mapeo de nombres de campos del formulario a nombres de columnas en la base de datos
			const fieldMapping: Record<string, string> = {
				// Datos del paciente
				fullName: 'full_name',
				idNumber: 'id_number',
				phone: 'phone',
				email: 'email',

				// Datos del servicio
				examType: 'exam_type',
				origin: 'origin',
				treatingDoctor: 'treating_doctor',
				sampleType: 'sample_type',
				relationship: 'relationship',

				// Otros campos
				branch: 'branch',
				comments: 'comments',
			}

			const dbFieldName = fieldMapping[fieldName] || fieldName

			// Consultar valores únicos que coincidan con el término de búsqueda
			const { data, error } = await supabase
				.from('medical_records_clean')
				.select(dbFieldName)
				.ilike(dbFieldName, `%${searchTerm}%`)
				.not(dbFieldName, 'is', null)
				.not(dbFieldName, 'eq', '')
				.limit(50)
				.abortSignal(signal) // Agregar señal de cancelación

			// Verificar si la búsqueda fue cancelada
			if (signal.aborted) {
				return
			}

			if (error) {
				console.error('Error fetching autocomplete suggestions:', error)
				setSuggestions([])
				return
			}

			// Contar frecuencia de cada valor y ordenar por popularidad
			const valueCounts: Record<string, number> = {}

			data?.forEach((record: any) => {
				const value = record[dbFieldName]?.trim()
				if (value && value.toLowerCase().includes(searchTerm.toLowerCase())) {
					valueCounts[value] = (valueCounts[value] || 0) + 1
				}
			})

			// Convertir a array y ordenar por frecuencia
			const sortedSuggestions = Object.entries(valueCounts)
				.map(([value, count]) => ({ value, count }))
				.sort((a, b) => {
					// Primero ordenar por relevancia (si empieza con el término de búsqueda)
					const aStartsWith = a.value.toLowerCase().startsWith(searchTerm.toLowerCase())
					const bStartsWith = b.value.toLowerCase().startsWith(searchTerm.toLowerCase())

					if (aStartsWith && !bStartsWith) return -1
					if (!aStartsWith && bStartsWith) return 1

					// Luego por frecuencia
					return b.count - a.count
				})
				.slice(0, 8) // Mostrar hasta 8 sugerencias

			// Solo actualizar si la búsqueda no fue cancelada
			if (!signal.aborted) {
				setSuggestions(sortedSuggestions)
			}
		} catch (error: any) {
			// Ignorar errores de cancelación
			if (error.name === 'AbortError') {
				return
			}
			console.error('Error in autocomplete:', error)
			setSuggestions([])
		} finally {
			// Solo actualizar loading si la búsqueda no fue cancelada
			if (!signal.aborted) {
				setIsLoading(false)
			}
		}
	}

	// Limpiar AbortController al desmontar el componente
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])

	return {
		suggestions,
		isLoading,
		getSuggestions,
	}
}
