import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'
import { memo } from 'react'
import { createCalculatorInputHandler } from '@shared/utils/number-utils'

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

export const ConverterVEStoUSD = memo(
	({ vesInputValue, setVesInputValue, usdFromVes, inputStyles }: CurrencyConverterProps) => {
		// Calculator handlers for both inputs

		const vesCalculatorHandler = createCalculatorInputHandler(parseFloat(vesInputValue) || 0, (value: number) =>
			setVesInputValue(value.toString()),
		)

		return (
			<div className="w-full space-y-2">
				<FormLabel className="text-sm sm:text-base">Convertidor VES a USD</FormLabel>
				<Input
					type="text"
					inputMode="decimal"
					placeholder="0,00"
					value={vesCalculatorHandler.displayValue}
					onKeyDown={vesCalculatorHandler.handleKeyDown}
					onPaste={vesCalculatorHandler.handlePaste}
					onFocus={vesCalculatorHandler.handleFocus}
					onChange={vesCalculatorHandler.handleChange}
					className={`${inputStyles} text-right font-mono`}
					autoComplete="off"
				/>
				{usdFromVes && <p className="text-xs sm:text-sm font-bold text-green-600">{usdFromVes} USD</p>}
				{/* <p className="text-[10px] sm:text-xs text-muted-foreground">
					{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
				</p> */}
			</div>
		)
	},
)

ConverterVEStoUSD.displayName = 'ConverterVEStoUSD'
