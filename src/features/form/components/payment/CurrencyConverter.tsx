import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'
import { memo, useCallback } from 'react'

interface CurrencyConverterProps {
	usdValue: string
	setUsdValue: (value: string) => void
	vesValue: string
	vesInputValue: string
	setVesInputValue: (value: string) => void
	usdFromVes: string
	exchangeRate: number | undefined
	isLoadingRate: boolean
	inputStyles: string
}

export const CurrencyConverter = memo(({
	usdValue,
	setUsdValue,
	vesValue,
	vesInputValue,
	setVesInputValue,
	usdFromVes,
	exchangeRate,
	isLoadingRate,
	inputStyles,
}: CurrencyConverterProps) => {
	// Memoize handlers to prevent unnecessary re-renders
	const handleUsdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
			setUsdValue(val)
		}
	}, [setUsdValue])

	const handleVesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
			setVesInputValue(val)
		}
	}, [setVesInputValue])

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<FormLabel>Convertidor USD a VES</FormLabel>
				<Input
					type="text"
					inputMode="decimal"
					placeholder="Ingrese monto en Dólares"
					value={usdValue}
					onChange={handleUsdChange}
					className={inputStyles}
				/>
				{vesValue && <p className="text-sm font-bold text-green-600">{vesValue} VES</p>}
			</div>
			
			<div className="space-y-2">
				<FormLabel>Convertidor VES a USD</FormLabel>
				<Input
					type="text"
					inputMode="decimal"
					placeholder="Ingrese monto en Bolívares"
					value={vesInputValue}
					onChange={handleVesChange}
					className={inputStyles}
				/>
				{usdFromVes && <p className="text-sm font-bold text-green-600">{usdFromVes} USD</p>}
			</div>
			
			<p className="text-xs text-muted-foreground">
				{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
			</p>
		</div>
	)
})

CurrencyConverter.displayName = 'CurrencyConverter'