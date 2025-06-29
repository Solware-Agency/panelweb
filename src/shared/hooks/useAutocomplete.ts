import { useState, useEffect, useRef } from 'react'
import { supabase } from '@lib/supabase/config'

interface AutocompleteOption {
	value: string
	count: number
}

export const useAutocomplete = (fieldName: string, minLength: number = 0) => {
	const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const abortControllerRef = useRef<AbortController | null>(null)
	const [allFieldValues, setAllFieldValues] = useState<AutocompleteOption[]>([])
	const [hasPreloadedData, setHasPreloadedData] = useState(false)

	// Preload all values for the field when the hook initializes - ONLY ONCE
	useEffect(() => {
		let isMounted = true

		const preloadFieldValues = async () => {
			if (hasPreloadedData) return // Prevent multiple loads

			try {
				setIsLoading(true)

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

				if (!isMounted) return

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
				setHasPreloadedData(true)
			} catch (error) {
				console.error('Error preloading field values:', error)
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		preloadFieldValues()

		return () => {
			isMounted = false
		}
	}, [fieldName]) // Only depend on fieldName, not hasPreloadedData

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

	// FIXED: getSuggestions now only processes preloaded data, no async calls
	const getSuggestions = (searchTerm: string = '') => {
		// Cancel any previous abort controller
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		// Only process if we have preloaded data
		if (!hasPreloadedData || allFieldValues.length === 0) {
			setSuggestions([])
			return
		}

		// Process suggestions synchronously from preloaded data
		const filteredSuggestions = getFilteredSuggestions(searchTerm)
		setSuggestions(filteredSuggestions)
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
		hasPreloadedData,
	}
}