import { FormLabel } from '@shared/components/ui/form'
import { Input } from '@shared/components/ui/input'
import { useMemo } from 'react'

interface CurrencyConverterProps {
	usdValue: string
	setUsdValue: (value: string) => void
	vesValue: string
	exchangeRate: number | undefined
	isLoadingRate: boolean
	inputStyles: string
}

export const CurrencyConverter = ({
	usdValue,
	setUsdValue,
	vesValue,
	exchangeRate,
	isLoadingRate,
	inputStyles,
}: CurrencyConverterProps) => {
	const usdFromVes = useMemo(() => {
		if (!vesValue || !exchangeRate || isNaN(Number(vesValue))) return '0.00'
		return (Number(vesValue) / exchangeRate).toFixed(2)
	}, [vesValue, exchangeRate])

	const handleVesChange = (value: string) => {
		if (!exchangeRate) return
		const vesAmount = Number(value)
		if (!isNaN(vesAmount)) {
			const usdAmount = (vesAmount / exchangeRate).toFixed(2)
			setUsdValue(usdAmount)
		}
	}

	return (
		<>
			{/* USD to VES Converter */}
			<div className="space-y-2">
				<FormLabel className="text-sm font-medium text-gray-700">
					Convertir USD a Bs
				</FormLabel>
				<Input
					type="number"
					step="0.01"
					placeholder="0.00"
					value={usdValue}
					onChange={(e) => setUsdValue(e.target.value)}
					className={inputStyles}
					disabled={isLoadingRate}
				/>
				<p className="text-sm text-gray-600">
					= Bs {vesValue} {exchangeRate && `(Tasa: ${exchangeRate.toFixed(2)})`}
				</p>
			</div>

			{/* VES to USD Converter */}
			<div className="space-y-2">
				<FormLabel className="text-sm font-medium text-gray-700">
					Convertir Bs a USD
				</FormLabel>
				<Input
					type="number"
					step="0.01"
					placeholder="0.00"
					onChange={(e) => handleVesChange(e.target.value)}
					className={inputStyles}
					disabled={isLoadingRate}
				/>
				<p className="text-sm text-gray-600">
					= ${usdFromVes} {exchangeRate && `(Tasa: ${exchangeRate.toFixed(2)})`}
				</p>
			</div>
		</>
	)
}