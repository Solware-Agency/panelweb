import { useState, useEffect, useRef } from 'react'
import { supabase } from '@lib/supabase/config'

interface AutocompleteOption {
	value: string
	count: number
}

export const useAutocomplete = (fieldName: string, minLength: number = 2) => {
	const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const abortControllerRef = useRef<AbortController | null>(null)
	const lastSearchTermRef = useRef<string>('')
	const [allFieldValues, setAllFieldValues] = useState<AutocompleteOption[]>([])

	// Preload all values for the field when the hook initializes
	useEffect(() => {
		const preloadFieldValues = async () => {
			try {
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

				const { data, error } = await supabase
					.from('medical_records_clean')
					.select(dbFieldName)
					.not(dbFieldName, 'is', null)
					.not(dbFieldName, 'eq', '')

				if (error) {
					console.error('Error preloading field values:', error)
					return
				}

				// Count frequency of each value
				const valueCounts: Record<string, number> = {}
				data?.forEach((record: any) => {
					const value = record[dbFieldName]?.trim()
					if (value) {
						valueCounts[value] = (valueCounts[value] || 0) + 1
					}
				})

				// Convert to array and sort by frequency
				const allValues = Object.entries(valueCounts)
					.map(([value, count]) => ({ value, count }))
					.sort((a, b) => b.count - a.count)

				setAllFieldValues(allValues)
			} catch (error) {
				console.error('Error preloading field values:', error)
			}
		}

		preloadFieldValues()
	}, [fieldName])

	// Function to get random suggestions from all values
	const getRandomSuggestions = (count: number = 8): AutocompleteOption[] => {
		if (allFieldValues.length === 0) return []
		
		// Create a weighted random selection based on frequency
		const weightedValues = allFieldValues.flatMap(item => 
			Array(Math.min(item.count, 10)).fill(item) // Limit weight to prevent dominance
		)
		
		const randomSuggestions: AutocompleteOption[] = []
		const usedValues = new Set<string>()
		
		while (randomSuggestions.length < count && randomSuggestions.length < allFieldValues.length) {
			const randomIndex = Math.floor(Math.random() * weightedValues.length)
			const randomItem = weightedValues[randomIndex]
			
			if (!usedValues.has(randomItem.value)) {
				randomSuggestions.push(randomItem)
				usedValues.add(randomItem.value)
			}
		}
		
		return randomSuggestions
	}

	// Function to get filtered suggestions based on search term
	const getFilteredSuggestions = (searchTerm: string): AutocompleteOption[] => {
		if (!searchTerm || searchTerm.length === 0) {
			return getRandomSuggestions()
		}

		const filtered = allFieldValues.filter(item =>
			item.value.toLowerCase().includes(searchTerm.toLowerCase())
		)

		// Sort filtered results by relevance
		return filtered.sort((a, b) => {
			// Prioritize items that start with the search term
			const aStartsWith = a.value.toLowerCase().startsWith(searchTerm.toLowerCase())
			const bStartsWith = b.value.toLowerCase().startsWith(searchTerm.toLowerCase())

			if (aStartsWith && !bStartsWith) return -1
			if (!aStartsWith && bStartsWith) return 1

			// Then by frequency
			return b.count - a.count
		}).slice(0, 8)
	}

	const getSuggestions = async (searchTerm: string = '') => {
		// Cancel previous search if exists
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		// Create new AbortController for this search
		abortControllerRef.current = new AbortController()
		const signal = abortControllerRef.current.signal

		setIsLoading(true)
		lastSearchTermRef.current = searchTerm

		try {
			// If we have preloaded values, use them for instant results
			if (allFieldValues.length > 0) {
				const filteredSuggestions = getFilteredSuggestions(searchTerm)
				
				// Check if search was cancelled
				if (!signal.aborted) {
					setSuggestions(filteredSuggestions)
				}
			} else {
				// Fallback to database query if preloaded values aren't ready
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

				let query = supabase
					.from('medical_records_clean')
					.select(dbFieldName)
					.not(dbFieldName, 'is', null)
					.not(dbFieldName, 'eq', '')
					.limit(50)
					.abortSignal(signal)

				// If there's a search term, filter by it
				if (searchTerm && searchTerm.length > 0) {
					query = query.ilike(dbFieldName, `%${searchTerm}%`)
				}

				const { data, error } = await query

				// Check if search was cancelled
				if (signal.aborted) {
					return
				}

				if (error) {
					console.error('Error fetching autocomplete suggestions:', error)
					setSuggestions([])
					return
				}

				// Count frequency and process results
				const valueCounts: Record<string, number> = {}
				data?.forEach((record: any) => {
					const value = record[dbFieldName]?.trim()
					if (value && (!searchTerm || value.toLowerCase().includes(searchTerm.toLowerCase()))) {
						valueCounts[value] = (valueCounts[value] || 0) + 1
					}
				})

				// Convert to array and sort
				let sortedSuggestions = Object.entries(valueCounts)
					.map(([value, count]) => ({ value, count }))

				if (searchTerm && searchTerm.length > 0) {
					// Sort by relevance for search
					sortedSuggestions.sort((a, b) => {
						const aStartsWith = a.value.toLowerCase().startsWith(searchTerm.toLowerCase())
						const bStartsWith = b.value.toLowerCase().startsWith(searchTerm.toLowerCase())

						if (aStartsWith && !bStartsWith) return -1
						if (!aStartsWith && bStartsWith) return 1

						return b.count - a.count
					})
				} else {
					// Random order for initial suggestions
					sortedSuggestions = sortedSuggestions
						.sort(() => Math.random() - 0.5)
						.sort((a, b) => b.count - a.count) // Still prefer more frequent items
				}

				// Only update if search wasn't cancelled
				if (!signal.aborted) {
					setSuggestions(sortedSuggestions.slice(0, 8))
				}
			}
		} catch (error: any) {
			// Ignore cancellation errors
			if (error.name === 'AbortError') {
				return
			}
			console.error('Error in autocomplete:', error)
			setSuggestions([])
		} finally {
			// Only update loading if search wasn't cancelled
			if (!signal.aborted) {
				setIsLoading(false)
			}
		}
	}

	// Clean up AbortController on unmount
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
		hasPreloadedData: allFieldValues.length > 0,
	}
}