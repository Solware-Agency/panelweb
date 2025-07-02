import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'
import { useState, useEffect } from 'react'

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

export const CurrencyConverter = ({
	usdValue,
	setUsdValue,
	vesValue,
	vesInputValue,
	setVesInputValue,
	usdFromVes,
	exchangeRate,
	isLoadingRate,
	inputStyles,
}: CurrencyConverterProps) => (
	<div className="space-y-2">
		<FormLabel>Convertidor USD a VES</FormLabel>
		<Input
			type="text"
			inputMode="decimal"
			placeholder="Ingrese monto en Dólares"
			value={usdValue}
			onChange={(e) => {
				const val = e.target.value
				if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
					setUsdValue(val)
				}
			}}
			className={inputStyles}
		/>
		{vesValue && <p className="text-sm font-bold text-green-600">{vesValue} VES</p>}
		<p className="text-xs text-muted-foreground">
			{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
		</p>
	</div>
)